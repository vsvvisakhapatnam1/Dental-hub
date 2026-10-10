"""Tests for Emergent Google OAuth session endpoint, session management, and staff gate.

Covers:
- POST /api/auth/google/session: 400 (missing header), 401 (invalid session via Emergent)
- Session management per /app/auth_testing.md: inject user+session in Mongo, verify Bearer + cookie auth on /api/auth/me
- Regression: staff password login works; logout invalidates session
"""
import os
import uuid
import asyncio
from datetime import datetime, timezone, timedelta

import pytest
import requests
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path("/app/backend/.env"))

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
if not BASE_URL:
    # fallback: read frontend .env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

ADMIN_EMAIL = "vsv.visakhapatnam@gmail.com"
ADMIN_PASSWORD = "DentalHub@2026"


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Google session endpoint ----------
class TestGoogleSessionEndpoint:
    def test_missing_x_session_id_returns_400(self, api):
        r = api.post(f"{BASE_URL}/api/auth/google/session", json={})
        assert r.status_code == 400
        assert "session" in r.json().get("detail", "").lower()

    def test_invalid_session_id_returns_401(self, api):
        r = api.post(
            f"{BASE_URL}/api/auth/google/session",
            json={},
            headers={"X-Session-ID": "fake-invalid-session-id-xyz"},
        )
        assert r.status_code == 401
        assert "validate" in r.json().get("detail", "").lower() or "session" in r.json().get("detail", "").lower()

    def test_staff_gate_code_path_exists(self):
        """Verify STAFF_EMAILS allowlist is enforced in google_session handler."""
        src = Path("/app/backend/server.py").read_text()
        # Locate google_session handler and verify allowlist check between fetching email and inserting user
        gs_idx = src.find("async def google_session")
        assert gs_idx > 0
        snippet = src[gs_idx:gs_idx + 2000]
        assert "STAFF_EMAILS" in snippet
        assert "403" in snippet or "team members" in snippet.lower()


# ---------- Session injection per auth_testing.md ----------
class TestSessionInjection:
    @pytest.fixture(scope="class")
    def injected(self):
        async def _setup():
            client = AsyncIOMotorClient(MONGO_URL)
            db = client[DB_NAME]
            user_id = str(uuid.uuid4())
            email = f"TEST_inject_{uuid.uuid4().hex[:8]}@test.dentalhub.in"
            session_token = f"TEST_tok_{uuid.uuid4().hex}"
            await db.users.insert_one({
                "id": user_id, "email": email, "name": "Injected User",
                "role": "seeker", "auth_provider": "google", "password_hash": None,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            await db.user_sessions.insert_one({
                "session_token": session_token, "user_id": user_id,
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            return user_id, email, session_token, db

        user_id, email, token, db = asyncio.get_event_loop().run_until_complete(_setup())
        yield {"user_id": user_id, "email": email, "token": token}

        async def _cleanup():
            await db.user_sessions.delete_one({"session_token": token})
            await db.users.delete_one({"id": user_id})
        asyncio.get_event_loop().run_until_complete(_cleanup())

    def test_bearer_auth_me(self, api, injected):
        r = api.get(f"{BASE_URL}/api/auth/me",
                    headers={"Authorization": f"Bearer {injected['token']}"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == injected["email"]
        assert data["id"] == injected["user_id"]
        assert "password_hash" not in data
        assert "_id" not in data

    def test_cookie_auth_me(self, injected):
        r = requests.get(f"{BASE_URL}/api/auth/me",
                         cookies={"session_token": injected["token"]})
        assert r.status_code == 200, r.text
        assert r.json()["email"] == injected["email"]

    def test_invalid_bearer_token_401(self, api):
        r = api.get(f"{BASE_URL}/api/auth/me",
                    headers={"Authorization": "Bearer nonsense-token-xyz"})
        assert r.status_code == 401


# ---------- Regression: staff login + logout ----------
class TestStaffLoginLogout:
    def test_staff_login_and_logout_invalidates(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["role"] == "admin"
        token = data["session_token"]
        assert token

        # /auth/me works with Bearer
        me = api.get(f"{BASE_URL}/api/auth/me",
                     headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200
        assert me.json()["email"] == ADMIN_EMAIL

        # logout
        lo = api.post(f"{BASE_URL}/api/auth/logout",
                      headers={"Authorization": f"Bearer {token}"})
        assert lo.status_code == 200

        # subsequent /me returns 401
        me2 = api.get(f"{BASE_URL}/api/auth/me",
                      headers={"Authorization": f"Bearer {token}"})
        assert me2.status_code == 401

    def test_non_staff_login_rejected(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login",
                     json={"email": "nonstaff@example.com", "password": "whatever"})
        assert r.status_code == 403
        assert "team members" in r.json()["detail"].lower()

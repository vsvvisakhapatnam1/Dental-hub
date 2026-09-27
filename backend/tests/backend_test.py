"""Backend tests for Dental Opportunity Hub."""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to frontend/.env
    from pathlib import Path
    for line in Path("/app/frontend/.env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

API = f"{BASE_URL}/api"

ADMIN_EMAIL = "vsv.visakhapatnam@gmail.com"
ADMIN_PASSWORD = "DentalHub@2026"


def _client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _auth_client(token: str):
    s = _client()
    s.headers.update({"Authorization": f"Bearer {token}"})
    return s


@pytest.fixture(scope="session")
def admin_token():
    r = _client().post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("role") == "admin"
    return data["session_token"]


@pytest.fixture(scope="session")
def seeker():
    email = f"TEST_seeker_{uuid.uuid4().hex[:8]}@test.dentalhub.in"
    payload = {
        "email": email, "password": "Test@1234", "name": "Test Seeker",
        "role": "seeker", "profile_type": "BDS Dentist", "city": "Hyderabad",
        "state": "Telangana", "qualification": "BDS", "speciality": "General Dentistry",
        "experience": "0-2 years", "looking_for": ["Dental Job"],
    }
    r = _client().post(f"{API}/auth/register", json=payload)
    assert r.status_code == 200, f"seeker register failed: {r.text}"
    data = r.json()
    return {"email": email, "password": "Test@1234", "token": data["session_token"], "id": data["id"]}


@pytest.fixture(scope="session")
def giver():
    email = f"TEST_giver_{uuid.uuid4().hex[:8]}@test.dentalhub.in"
    payload = {
        "email": email, "password": "Test@1234", "name": "Test Giver",
        "role": "giver", "profile_type": "Clinic", "org_name": "TEST Clinic",
        "city": "Hyderabad", "state": "Telangana", "contact_person": "Owner",
        "offering": ["Dental Job"],
    }
    r = _client().post(f"{API}/auth/register", json=payload)
    assert r.status_code == 200, f"giver register failed: {r.text}"
    data = r.json()
    return {"email": email, "password": "Test@1234", "token": data["session_token"], "id": data["id"]}


# --------- Auth ---------
class TestAuth:
    def test_login_wrong_password(self):
        r = _client().post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_admin_ok(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 10

    def test_me_with_bearer(self, admin_token):
        r = _auth_client(admin_token).get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_unauthenticated(self):
        r = _client().get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_register_duplicate(self, seeker):
        r = _client().post(f"{API}/auth/register", json={
            "email": seeker["email"], "password": "x", "name": "dup", "role": "seeker",
        })
        assert r.status_code == 400

    def test_logout(self, seeker):
        # Login fresh to get a disposable token
        r = _client().post(f"{API}/auth/login", json={"email": seeker["email"], "password": seeker["password"]})
        assert r.status_code == 200
        tok = r.json()["session_token"]
        c = _auth_client(tok)
        assert c.post(f"{API}/auth/logout").status_code == 200
        assert c.get(f"{API}/auth/me").status_code == 401


# --------- Opportunities ---------
class TestOpportunities:
    def test_list_published(self):
        r = _client().get(f"{API}/opportunities")
        assert r.status_code == 200
        docs = r.json()
        assert isinstance(docs, list) and len(docs) >= 1
        assert all(d.get("status") == "published" for d in docs)

    def test_filter_mode_offering(self):
        r = _client().get(f"{API}/opportunities", params={"mode": "offering"})
        assert r.status_code == 200
        assert all(d["mode"] == "offering" for d in r.json())

    def test_filter_mode_looking(self):
        r = _client().get(f"{API}/opportunities", params={"mode": "looking"})
        assert r.status_code == 200
        assert all(d["mode"] == "looking" for d in r.json())

    def test_filter_city(self):
        r = _client().get(f"{API}/opportunities", params={"city": "Hyderabad"})
        assert r.status_code == 200
        assert all(d["city"] == "Hyderabad" for d in r.json())

    def test_filter_verified(self):
        r = _client().get(f"{API}/opportunities", params={"verified": "true"})
        assert r.status_code == 200
        assert all(d.get("verification_status") in ["clinic", "credential", "organisation"] for d in r.json())

    def test_search_q(self):
        r = _client().get(f"{API}/opportunities", params={"q": "Endodontist"})
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_create_opportunity_requires_auth(self):
        r = _client().post(f"{API}/opportunities", json={"mode": "offering", "category": "Job", "title": "x"})
        assert r.status_code == 401

    def test_create_opportunity_pending(self, giver):
        payload = {
            "mode": "offering", "category": "Associate Dentist",
            "title": "TEST Associate Role", "description": "Test",
            "city": "Hyderabad", "state": "Telangana", "speciality": "General Dentistry",
            "qualification": "BDS", "experience": "0-2 years", "employment_type": "Full-time",
            "compensation": "₹30k", "requirements": "x", "perks": "y",
            "contact_method": "email", "contact_value": giver["email"],
        }
        r = _auth_client(giver["token"]).post(f"{API}/opportunities", json=payload)
        assert r.status_code == 200, r.text
        doc = r.json()
        assert doc["status"] == "pending"
        assert doc["poster_id"] == giver["id"]
        # verify via GET
        r2 = _client().get(f"{API}/opportunities/{doc['id']}")
        assert r2.status_code == 200
        assert r2.json()["title"] == "TEST Associate Role"

    def test_my_opportunities(self, giver):
        r = _auth_client(giver["token"]).get(f"{API}/my/opportunities")
        assert r.status_code == 200
        docs = r.json()
        assert any(d["title"] == "TEST Associate Role" for d in docs)


# --------- Applications ---------
class TestApplications:
    def test_apply_and_persist(self, seeker):
        # get a published opportunity
        opps = _client().get(f"{API}/opportunities").json()
        assert opps
        opp = opps[0]
        r = _auth_client(seeker["token"]).post(
            f"{API}/applications",
            json={"opportunity_id": opp["id"], "message": "Interested"},
        )
        assert r.status_code == 200, r.text
        app_doc = r.json()
        assert app_doc["opportunity_id"] == opp["id"]
        assert app_doc["applicant_id"] == seeker["id"]

        # Duplicate must fail
        r2 = _auth_client(seeker["token"]).post(
            f"{API}/applications",
            json={"opportunity_id": opp["id"], "message": "again"},
        )
        assert r2.status_code == 400

        # My applications
        r3 = _auth_client(seeker["token"]).get(f"{API}/my/applications")
        assert r3.status_code == 200
        assert any(a["opportunity_id"] == opp["id"] for a in r3.json())

    def test_apply_requires_auth(self):
        r = _client().post(f"{API}/applications", json={"opportunity_id": "x"})
        assert r.status_code == 401


# --------- Directory ---------
class TestDirectory:
    def test_dentists(self):
        r = _client().get(f"{API}/directory/dentists")
        assert r.status_code == 200
        docs = r.json()
        assert len(docs) >= 6
        assert all("password_hash" not in d for d in docs)

    def test_dentists_filter(self):
        r = _client().get(f"{API}/directory/dentists", params={"city": "Hyderabad"})
        assert r.status_code == 200
        assert all(d.get("city") == "Hyderabad" for d in r.json())

    def test_clinics(self):
        r = _client().get(f"{API}/directory/clinics")
        assert r.status_code == 200
        assert len(r.json()) >= 4

    def test_public_user(self):
        dentists = _client().get(f"{API}/directory/dentists").json()
        uid = dentists[0]["id"]
        r = _client().get(f"{API}/directory/user/{uid}")
        assert r.status_code == 200
        d = r.json()
        assert "password_hash" not in d
        assert "phone" not in d  # hidden


# --------- Admin ---------
class TestAdmin:
    def test_admin_stats(self, admin_token):
        r = _auth_client(admin_token).get(f"{API}/admin/stats")
        assert r.status_code == 200
        s = r.json()
        for k in ["users", "dentists", "clinics", "opportunities", "pending_opportunities", "applications"]:
            assert k in s

    def test_admin_stats_forbidden_for_seeker(self, seeker):
        r = _auth_client(seeker["token"]).get(f"{API}/admin/stats")
        assert r.status_code == 403

    def test_admin_opps_and_moderation(self, admin_token):
        c = _auth_client(admin_token)
        # find a pending opp
        pending = c.get(f"{API}/admin/opportunities", params={"status": "pending"}).json()
        assert len(pending) >= 1
        opp = pending[0]
        # publish it
        r = c.put(f"{API}/admin/opportunities/{opp['id']}/status", params={"status": "published"})
        assert r.status_code == 200
        # verify via public GET
        assert _client().get(f"{API}/opportunities/{opp['id']}").json()["status"] == "published"
        # feature it
        r2 = c.put(f"{API}/admin/opportunities/{opp['id']}/feature", params={"featured": "true"})
        assert r2.status_code == 200
        assert _client().get(f"{API}/opportunities/{opp['id']}").json()["featured"] is True

    def test_admin_verify_user(self, admin_token, seeker):
        c = _auth_client(admin_token)
        r = c.put(f"{API}/admin/users/{seeker['id']}/verify", params={"level": "credential", "value": "true"})
        assert r.status_code == 200
        # confirm via me
        me = _auth_client(seeker["token"]).get(f"{API}/auth/me").json()
        assert me["verification"]["credential"] is True

    def test_admin_users_and_apps(self, admin_token):
        c = _auth_client(admin_token)
        assert c.get(f"{API}/admin/users").status_code == 200
        assert c.get(f"{API}/admin/applications").status_code == 200

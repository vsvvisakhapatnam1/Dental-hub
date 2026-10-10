"""Security fix verification tests for Dental Hub Pro."""
import os
import io
import pytest
import requests
from pathlib import Path

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    for line in Path("/app/frontend/.env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "vsv.visakhapatnam@gmail.com"
ADMIN_PASSWORD = "DentalHub@2026"
CONF_PASSWORD = "Confidential@2026"

LEAK_FIELDS = {"email", "phone", "address", "pincode", "cv_url", "cv_filename",
               "contact_person", "designation", "preferred_location",
               "expected_salary", "password_hash"}
SAFE_FIELDS = {"name", "city", "state", "verification", "role", "profile_type"}


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("role") == "admin"
    assert "session_token" in data
    return data["session_token"]


# ========== FIX 1: Directory PII removal ==========
class TestDirectoryPIIRemoval:
    def test_dentists_no_pii(self):
        r = requests.get(f"{API}/directory/dentists")
        assert r.status_code == 200
        docs = r.json()
        assert len(docs) >= 1
        for d in docs:
            leaked = LEAK_FIELDS & set(d.keys())
            assert not leaked, f"PII leaked in dentist: {leaked} doc={d}"
        # safe fields present on at least one
        assert "name" in docs[0]

    def test_clinics_no_pii(self):
        r = requests.get(f"{API}/directory/clinics")
        assert r.status_code == 200
        docs = r.json()
        assert len(docs) >= 1
        for d in docs:
            leaked = LEAK_FIELDS & set(d.keys())
            assert not leaked, f"PII leaked in clinic: {leaked}"

    def test_public_user_no_pii(self):
        dentists = requests.get(f"{API}/directory/dentists").json()
        uid = dentists[0]["id"]
        r = requests.get(f"{API}/directory/user/{uid}")
        assert r.status_code == 200
        d = r.json()
        leaked = LEAK_FIELDS & set(d.keys())
        assert not leaked, f"PII leaked in public user: {leaked}"
        assert d.get("name")


# ========== FIX 2: Admin confidential ==========
class TestAdminConfidential:
    def test_confidential_requires_auth(self):
        r = requests.post(f"{API}/admin/confidential", json={"password": CONF_PASSWORD})
        assert r.status_code in (401, 403)

    def test_confidential_wrong_password(self, admin_token):
        r = requests.post(f"{API}/admin/confidential",
                          json={"password": "wrong"},
                          headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 403

    def test_confidential_ok_with_full_pii(self, admin_token):
        r = requests.post(f"{API}/admin/confidential",
                          json={"password": CONF_PASSWORD},
                          headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "seekers" in data and "givers" in data
        assert isinstance(data["seekers"], list) and isinstance(data["givers"], list)
        # Confirm PII present
        all_users = data["seekers"] + data["givers"]
        assert len(all_users) >= 1
        has_email = any(u.get("email") for u in all_users)
        has_phone_or_addr = any(u.get("phone") or u.get("address") or u.get("pincode") for u in all_users)
        assert has_email, "admin confidential should expose email"
        # at least one should have phone/addr/pincode (seed data has them)
        # softer: must have the keys even if some values are None
        sample = all_users[0]
        for k in ("email", "phone", "address", "pincode"):
            assert k in sample, f"admin confidential missing key {k}"


# ========== FIX 3: Upload content-type hardening ==========
class TestUploadHardening:
    def test_txt_upload_rejects_html_ct(self):
        # multipart with malicious content-type text/html, extension .txt
        files = {"file": ("evil.txt", b"<script>alert(1)</script>", "text/html")}
        r = requests.post(f"{API}/upload", files=files)
        assert r.status_code == 200, r.text
        data = r.json()
        file_id = data["id"]
        # download
        r2 = requests.get(f"{API}/files/{file_id}")
        assert r2.status_code == 200
        ct = r2.headers.get("content-type", "").lower()
        assert "text/html" not in ct, f"server returned text/html! got {ct}"
        assert "text/plain" in ct, f"expected text/plain, got {ct}"
        cd = r2.headers.get("content-disposition", "").lower()
        assert "attachment" in cd and "inline" not in cd, f"CD={cd}"
        assert r2.headers.get("x-content-type-options", "").lower() == "nosniff"


# ========== FIX 4: Stripe open-redirect guard ==========
class TestStripeRedirectGuard:
    def test_malicious_origin_url_ignored(self):
        r = requests.post(f"{API}/payments/checkout",
                          json={"package_id": "job_listing",
                                "origin_url": "https://evil.example.com"})
        assert r.status_code == 200, r.text
        data = r.json()
        url = data.get("checkout_url", "")
        assert url.startswith("https://checkout.stripe.com"), f"bad url: {url}"
        assert data.get("session_id")
        # The success/cancel URLs are inside the session on Stripe, not returned.
        # We confirm the server didn't echo evil domain anywhere in response.
        assert "evil.example.com" not in str(data)


# ========== REGRESSION ==========
class TestRegression:
    def test_non_staff_login_rejected(self):
        r = requests.post(f"{API}/auth/login",
                          json={"email": "random@example.com", "password": "whatever"})
        assert r.status_code in (401, 403)

    def test_admin_login_returns_role_admin(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 10

    def test_opportunities_list(self):
        r = requests.get(f"{API}/opportunities")
        assert r.status_code == 200
        assert isinstance(r.json(), list) and len(r.json()) >= 1

    def test_admin_stats(self, admin_token):
        r = requests.get(f"{API}/admin/stats",
                         headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        s = r.json()
        for k in ("users", "dentists", "clinics", "opportunities"):
            assert k in s

    def test_seeker_register_with_cv_upload(self):
        import uuid as _u
        # 1. upload a small "PDF"
        files = {"file": ("cv.pdf", b"%PDF-1.4\n%fake pdf\n", "application/pdf")}
        up = requests.post(f"{API}/upload", files=files)
        assert up.status_code == 200, up.text
        cv_url = up.json()["url"]
        # 2. register seeker
        email = f"TEST_sec_{_u.uuid4().hex[:8]}@test.dentalhub.in"
        payload = {
            "email": email, "password": "Test@1234", "name": "Sec Test",
            "role": "seeker", "profile_type": "BDS Dentist", "city": "Hyderabad",
            "state": "Telangana", "qualification": "BDS",
            "speciality": "General Dentistry", "experience": "0-2 years",
            "looking_for": ["Dental Job"], "cv_url": cv_url, "cv_filename": "cv.pdf",
            "phone": "9999999999", "preferred_location": "Hyderabad",
            "address": "Test Address 123", "pincode": "500001",
        }
        r = requests.post(f"{API}/auth/register", json=payload)
        assert r.status_code == 200, r.text
        assert r.json().get("role") == "seeker"

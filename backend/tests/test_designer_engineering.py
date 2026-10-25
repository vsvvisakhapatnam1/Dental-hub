# Designer Engineering giver application (GST + testimonials), privacy & follow-up tests
# NOTE: only ONE successful registration here (each success sends real emails)
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN_EMAIL = "tdvsatishkumar@gmail.com"  # vsv.* password was changed via reset (password_changed=True)
ADMIN_PASSWORD = "DentalHub@2026"
CONF_PW = "Confidential@2026"
VALID_GST = "37ABCDE1234F1Z5"
TESTI = [{"client_name": "TEST_Clinic A", "contact": "9999999999", "feedback": "Great designs"}]


def base_giver(**kw):
    d = {
        "email": f"test_de_{uuid.uuid4().hex[:8]}@example.com", "password": "Test@12345",
        "name": "TEST_DE Giver", "role": "giver", "phone": "9876543210", "city": "Hyderabad",
        "preferred_location": "Hyderabad", "address": "TEST street",
    }
    d.update(kw)
    return d


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"admin login failed {r.status_code} {r.text}")
    return r.json().get("session_token") or r.cookies.get("session_token")


def _existing_de_user():
    # Reuse an existing TEST_DE user (avoid sending real emails on every run)
    try:
        import secrets
        from datetime import datetime, timedelta, timezone
        from pymongo import MongoClient
        from dotenv import dotenv_values
        env = dotenv_values("/app/backend/.env")
        db = MongoClient(env["MONGO_URL"])[env["DB_NAME"]]
        u = db.users.find_one({"name": "TEST_DE Giver", "gst_number": VALID_GST}, {"_id": 0, "password_hash": 0})
        if not u:
            return None
        tok = secrets.token_urlsafe(32)
        now = datetime.now(timezone.utc)
        db.user_sessions.insert_one({"session_token": tok, "user_id": u["id"],
                                     "expires_at": (now + timedelta(days=1)).isoformat(), "created_at": now.isoformat()})
        u["session_token"] = tok
        return u
    except Exception:
        return None


@pytest.fixture(scope="module")
def de_user():
    u = _existing_de_user()
    if u:
        return u
    r = requests.post(f"{BASE_URL}/api/auth/register", json=base_giver(
        profile_type="Designer Engineering", gst_number="37abcde1234f1z5",
        testimonials=TESTI + [{"client_name": "", "contact": "", "feedback": ""}]))
    assert r.status_code == 200, r.text
    return r.json()


# --- Validation (no user created) ---
class TestDEValidation:
    def test_missing_gst_and_testimonials_profile_type(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json=base_giver(profile_type="Designer Engineering"))
        assert r.status_code == 400
        d = r.json()["detail"]
        assert "Required fields missing" in d and "GST Number" in d and "Testimonials" in d

    def test_missing_via_offering(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json=base_giver(profile_type="Dental Clinic", offering=["Designer Engineering"]))
        assert r.status_code == 400
        assert "GST Number" in r.json()["detail"]

    def test_bad_gst(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json=base_giver(profile_type="Designer Engineering", gst_number="12345", testimonials=TESTI))
        assert r.status_code == 400
        assert r.json()["detail"] == "Invalid GST Number format"

    def test_gst_ok_but_incomplete_testimonial(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json=base_giver(
            profile_type="Designer Engineering", gst_number=VALID_GST,
            testimonials=[{"client_name": "X", "contact": "", "feedback": "y"}]))
        assert r.status_code == 400
        assert "Testimonials" in r.json()["detail"]

    def test_seeker_with_de_not_required(self):
        # seeker path still requires cv etc; ensure no GST mention
        r = requests.post(f"{BASE_URL}/api/auth/register", json=base_giver(role="seeker", profile_type="Designer Engineering"))
        assert r.status_code == 400
        assert "GST" not in r.json()["detail"]

    def test_non_de_giver_missing_address_no_gst(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json=base_giver(profile_type="Dental Clinic", address=""))
        assert r.status_code == 400
        assert "GST" not in r.json()["detail"] and "Address" in r.json()["detail"]


# --- Success + storage + privacy ---
class TestDESuccess:
    def test_register_stores_fields(self, de_user):
        assert de_user["gst_number"] == VALID_GST
        assert len(de_user["testimonials"]) == 1
        assert de_user["testimonials"][0]["client_name"] == "TEST_Clinic A"
        assert "password_hash" not in de_user and "_id" not in de_user

    def test_public_user_hides(self, de_user):
        r = requests.get(f"{BASE_URL}/api/directory/user/{de_user['id']}")
        assert r.status_code == 200
        d = r.json()
        for k in ("gst_number", "testimonials", "follow_up", "email", "phone"):
            assert k not in d

    def test_clinics_dir_hides(self, de_user):
        r = requests.get(f"{BASE_URL}/api/directory/clinics", params={"q": "TEST_DE"})
        assert r.status_code == 200
        rows = r.json()
        assert any(x["id"] == de_user["id"] for x in rows)
        for x in rows:
            assert "gst_number" not in x and "testimonials" not in x and "follow_up" not in x

    def test_confidential_has_gst(self, admin_token, de_user):
        h = {"Authorization": f"Bearer {admin_token}"}
        r = requests.post(f"{BASE_URL}/api/admin/confidential", json={"password": CONF_PW}, headers=h)
        assert r.status_code == 200
        g = next(x for x in r.json()["givers"] if x["id"] == de_user["id"])
        assert g["gst_number"] == VALID_GST and g["testimonials"][0]["feedback"] == "Great designs"

    def test_confidential_wrong_pw(self, admin_token):
        r = requests.post(f"{BASE_URL}/api/admin/confidential", json={"password": "nope"},
                          headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 403


# --- Follow-up ---
class TestFollowUp:
    def test_followup_requires_admin(self, de_user):
        r = requests.put(f"{BASE_URL}/api/admin/users/{de_user['id']}/followup", json={"contacted": True})
        assert r.status_code == 401

    def test_followup_non_admin_forbidden(self, de_user):
        r = requests.put(f"{BASE_URL}/api/admin/users/{de_user['id']}/followup", json={"contacted": True},
                         headers={"Authorization": f"Bearer {de_user['session_token']}"})
        assert r.status_code == 403

    def test_followup_set_and_persist(self, admin_token, de_user):
        h = {"Authorization": f"Bearer {admin_token}"}
        r = requests.put(f"{BASE_URL}/api/admin/users/{de_user['id']}/followup", json={"contacted": True, "note": "TEST_called"}, headers=h)
        assert r.status_code == 200
        assert r.json()["contacted"] is True and r.json()["by"] == ADMIN_EMAIL
        users = requests.get(f"{BASE_URL}/api/admin/users", headers=h).json()
        u = next(x for x in users if x["id"] == de_user["id"])
        assert u["follow_up"]["note"] == "TEST_called"

    def test_followup_404(self, admin_token):
        r = requests.put(f"{BASE_URL}/api/admin/users/nonexistent-id/followup", json={"contacted": False},
                         headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 404

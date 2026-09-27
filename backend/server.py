from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import uuid
import logging
import secrets
import bcrypt
import httpx
import sheets_sync

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Dental Opportunity Hub API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dental_hub")

SESSION_DAYS = 7
EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


# ---------------- Helpers ----------------
def now_utc():
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def default_verification():
    return {
        "mobile": False,
        "email": False,
        "qualification_submitted": False,
        "credential": False,
        "clinic": False,
        "organisation": False,
    }


def clean_user(u: dict) -> dict:
    if not u:
        return u
    u.pop("_id", None)
    u.pop("password_hash", None)
    return u


async def create_session(user_id: str) -> str:
    token = secrets.token_urlsafe(32)
    await db.user_sessions.insert_one({
        "session_token": token,
        "user_id": user_id,
        "expires_at": (now_utc() + timedelta(days=SESSION_DAYS)).isoformat(),
        "created_at": now_utc().isoformat(),
    })
    return token


def set_session_cookie(response: Response, token: str):
    response.set_cookie(
        key="session_token", value=token, httponly=True, secure=True,
        samesite="none", max_age=SESSION_DAYS * 24 * 3600, path="/",
    )


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await db.user_sessions.find_one({"session_token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now_utc():
        raise HTTPException(status_code=401, detail="Session expired")
    user = await db.users.find_one({"id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return clean_user(user)


async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------------- Models ----------------
class RegisterInput(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "seeker"  # seeker | giver
    profile_type: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    qualification: Optional[str] = None
    speciality: Optional[str] = None
    experience: Optional[str] = None
    looking_for: List[str] = Field(default_factory=list)
    offering: List[str] = Field(default_factory=list)
    preferred_type: Optional[str] = None
    availability: Optional[str] = None
    expected_salary: Optional[str] = None
    summary: Optional[str] = None
    # giver / org
    org_name: Optional[str] = None
    contact_person: Optional[str] = None
    designation: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    specialities: List[str] = Field(default_factory=list)
    facilities: List[str] = Field(default_factory=list)
    established: Optional[str] = None
    chairs: Optional[str] = None


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    qualification: Optional[str] = None
    speciality: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[List[str]] = None
    looking_for: Optional[List[str]] = None
    offering: Optional[List[str]] = None
    preferred_type: Optional[str] = None
    availability: Optional[str] = None
    expected_salary: Optional[str] = None
    summary: Optional[str] = None
    org_name: Optional[str] = None
    contact_person: Optional[str] = None
    designation: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    specialities: Optional[List[str]] = None
    facilities: Optional[List[str]] = None
    established: Optional[str] = None
    chairs: Optional[str] = None
    photo: Optional[str] = None


class OpportunityInput(BaseModel):
    mode: str  # looking | offering
    category: str
    title: str
    description: str = ""
    org_name: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    speciality: Optional[str] = None
    qualification: Optional[str] = None
    experience: Optional[str] = None
    employment_type: Optional[str] = None
    compensation: Optional[str] = None
    requirements: Optional[str] = None
    perks: Optional[str] = None
    contact_method: Optional[str] = "email"  # email | whatsapp
    contact_value: Optional[str] = None


class ApplicationInput(BaseModel):
    opportunity_id: str
    message: Optional[str] = ""


# ---------------- Auth Endpoints ----------------
@api_router.post("/auth/register")
async def register(payload: RegisterInput, response: Response):
    email = payload.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if payload.role not in ("seeker", "giver"):
        raise HTTPException(status_code=400, detail="Invalid role")
    user_id = str(uuid.uuid4())
    verification = default_verification()
    verification["email"] = True  # email set at registration (demo)
    doc = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(payload.password),
        "auth_provider": "email",
        "name": payload.name,
        "role": payload.role,
        "profile_type": payload.profile_type,
        "phone": payload.phone,
        "city": payload.city,
        "state": payload.state,
        "country": payload.country or "India",
        "qualification": payload.qualification,
        "speciality": payload.speciality,
        "experience": payload.experience,
        "skills": [],
        "looking_for": payload.looking_for,
        "offering": payload.offering,
        "preferred_type": payload.preferred_type,
        "availability": payload.availability,
        "expected_salary": payload.expected_salary,
        "summary": payload.summary,
        "org_name": payload.org_name,
        "contact_person": payload.contact_person,
        "designation": payload.designation,
        "website": payload.website,
        "address": payload.address,
        "specialities": payload.specialities,
        "facilities": payload.facilities,
        "established": payload.established,
        "chairs": payload.chairs,
        "photo": None,
        "verification": verification,
        "is_demo": False,
        "created_at": now_utc().isoformat(),
    }
    await db.users.insert_one(doc)
    await sheets_sync.sync_registration(doc)
    token = await create_session(user_id)
    set_session_cookie(response, token)
    out = clean_user({**doc})
    out["session_token"] = token
    return out


@api_router.post("/auth/login")
async def login(payload: LoginInput, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = await create_session(user["id"])
    set_session_cookie(response, token)
    out = clean_user(user)
    out["session_token"] = token
    return out


@api_router.post("/auth/google/session")
async def google_session(request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session id")
    async with httpx.AsyncClient() as hc:
        r = await hc.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Failed to validate session")
    data = r.json()
    email = data["email"].lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        user_id = existing["id"]
        if not existing.get("photo") and data.get("picture"):
            await db.users.update_one({"id": user_id}, {"$set": {"photo": data.get("picture")}})
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
    else:
        user_id = str(uuid.uuid4())
        verification = default_verification()
        verification["email"] = True
        user = {
            "id": user_id, "email": email, "password_hash": None, "auth_provider": "google",
            "name": data.get("name"), "role": "seeker", "profile_type": None, "phone": None,
            "city": None, "state": None, "country": "India", "qualification": None,
            "speciality": None, "experience": None, "skills": [], "looking_for": [], "offering": [],
            "preferred_type": None, "availability": None, "expected_salary": None, "summary": None,
            "org_name": None, "contact_person": None, "designation": None, "website": None,
            "address": None, "specialities": [], "facilities": [], "established": None, "chairs": None,
            "photo": data.get("picture"), "verification": verification, "is_demo": False,
            "created_at": now_utc().isoformat(),
        }
        await db.users.insert_one(user)
    token = data.get("session_token") or secrets.token_urlsafe(32)
    await db.user_sessions.insert_one({
        "session_token": token, "user_id": user_id,
        "expires_at": (now_utc() + timedelta(days=SESSION_DAYS)).isoformat(),
        "created_at": now_utc().isoformat(),
    })
    set_session_cookie(response, token)
    out = clean_user(user)
    out["session_token"] = token
    return out


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"success": True}


@api_router.put("/auth/profile")
async def update_profile(payload: ProfileUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    fresh = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return clean_user(fresh)


# ---------------- Opportunities ----------------
@api_router.get("/opportunities")
async def list_opportunities(
    mode: Optional[str] = None,
    category: Optional[str] = None,
    speciality: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    employment_type: Optional[str] = None,
    experience: Optional[str] = None,
    verified: Optional[bool] = None,
    q: Optional[str] = None,
    status: str = "published",
    limit: int = 100,
):
    query: dict = {}
    if status:
        query["status"] = status
    if mode:
        query["mode"] = mode
    if category:
        query["category"] = category
    if speciality:
        query["speciality"] = speciality
    if city:
        query["city"] = city
    if state:
        query["state"] = state
    if employment_type:
        query["employment_type"] = employment_type
    if experience:
        query["experience"] = experience
    if verified:
        query["verification_status"] = {"$in": ["clinic", "credential", "organisation"]}
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"org_name": {"$regex": q, "$options": "i"}},
            {"category": {"$regex": q, "$options": "i"}},
            {"speciality": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.opportunities.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return docs


@api_router.get("/opportunities/{opp_id}")
async def get_opportunity(opp_id: str):
    doc = await db.opportunities.find_one({"id": opp_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return doc


@api_router.post("/opportunities")
async def create_opportunity(payload: OpportunityInput, user: dict = Depends(get_current_user)):
    ver = user.get("verification", {})
    vstatus = "none"
    if ver.get("organisation"):
        vstatus = "organisation"
    elif ver.get("clinic"):
        vstatus = "clinic"
    elif ver.get("credential"):
        vstatus = "credential"
    elif ver.get("email"):
        vstatus = "email"
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "org_name": payload.org_name or user.get("org_name") or user.get("name"),
        "poster_id": user["id"],
        "poster_name": user.get("name"),
        "verification_status": vstatus,
        "status": "pending",
        "featured": False,
        "is_demo": False,
        "created_at": now_utc().isoformat(),
    }
    await db.opportunities.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/my/opportunities")
async def my_opportunities(user: dict = Depends(get_current_user)):
    docs = await db.opportunities.find({"poster_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    for d in docs:
        d["application_count"] = await db.applications.count_documents({"opportunity_id": d["id"]})
    return docs


@api_router.delete("/opportunities/{opp_id}")
async def delete_opportunity(opp_id: str, user: dict = Depends(get_current_user)):
    opp = await db.opportunities.find_one({"id": opp_id})
    if not opp:
        raise HTTPException(status_code=404, detail="Not found")
    if opp["poster_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")
    await db.opportunities.delete_one({"id": opp_id})
    return {"success": True}


# ---------------- Applications ----------------
@api_router.post("/applications")
async def apply(payload: ApplicationInput, user: dict = Depends(get_current_user)):
    opp = await db.opportunities.find_one({"id": payload.opportunity_id}, {"_id": 0})
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    existing = await db.applications.find_one({"opportunity_id": payload.opportunity_id, "applicant_id": user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Already applied")
    doc = {
        "id": str(uuid.uuid4()),
        "opportunity_id": payload.opportunity_id,
        "opportunity_title": opp.get("title"),
        "applicant_id": user["id"],
        "applicant_name": user.get("name"),
        "applicant_email": user.get("email"),
        "applicant_phone": user.get("phone"),
        "message": payload.message,
        "status": "submitted",
        "created_at": now_utc().isoformat(),
    }
    await db.applications.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/my/applications")
async def my_applications(user: dict = Depends(get_current_user)):
    docs = await db.applications.find({"applicant_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs


@api_router.get("/opportunities/{opp_id}/applications")
async def opportunity_applications(opp_id: str, user: dict = Depends(get_current_user)):
    opp = await db.opportunities.find_one({"id": opp_id})
    if not opp:
        raise HTTPException(status_code=404, detail="Not found")
    if opp["poster_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")
    docs = await db.applications.find({"opportunity_id": opp_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs


# ---------------- Directory ----------------
@api_router.get("/directory/dentists")
async def dentists(speciality: Optional[str] = None, city: Optional[str] = None, q: Optional[str] = None):
    query = {"role": "seeker"}
    if speciality:
        query["speciality"] = speciality
    if city:
        query["city"] = city
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"speciality": {"$regex": q, "$options": "i"}},
            {"qualification": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(200)
    return docs


@api_router.get("/directory/clinics")
async def clinics(city: Optional[str] = None, q: Optional[str] = None):
    query = {"role": "giver"}
    if city:
        query["city"] = city
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"org_name": {"$regex": q, "$options": "i"}},
            {"city": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(200)
    return docs


@api_router.get("/directory/user/{user_id}")
async def public_user(user_id: str):
    doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    # hide contact by default
    doc.pop("phone", None)
    return doc


# ---------------- Admin ----------------
@api_router.get("/admin/stats")
async def admin_stats(admin: dict = Depends(require_admin)):
    return {
        "users": await db.users.count_documents({}),
        "dentists": await db.users.count_documents({"role": "seeker"}),
        "clinics": await db.users.count_documents({"role": "giver"}),
        "opportunities": await db.opportunities.count_documents({}),
        "pending_opportunities": await db.opportunities.count_documents({"status": "pending"}),
        "published_opportunities": await db.opportunities.count_documents({"status": "published"}),
        "applications": await db.applications.count_documents({}),
    }


@api_router.get("/admin/opportunities")
async def admin_opportunities(status: Optional[str] = None, admin: dict = Depends(require_admin)):
    query = {}
    if status:
        query["status"] = status
    return await db.opportunities.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.put("/admin/opportunities/{opp_id}/status")
async def set_opp_status(opp_id: str, status: str = Query(...), admin: dict = Depends(require_admin)):
    if status not in ("published", "pending", "rejected"):
        raise HTTPException(status_code=400, detail="Invalid status")
    await db.opportunities.update_one({"id": opp_id}, {"$set": {"status": status}})
    return {"success": True}


@api_router.put("/admin/opportunities/{opp_id}/feature")
async def feature_opp(opp_id: str, featured: bool = Query(...), admin: dict = Depends(require_admin)):
    await db.opportunities.update_one({"id": opp_id}, {"$set": {"featured": featured}})
    return {"success": True}


@api_router.get("/admin/users")
async def admin_users(admin: dict = Depends(require_admin)):
    return await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)


@api_router.put("/admin/users/{user_id}/verify")
async def verify_user(user_id: str, level: str = Query(...), value: bool = Query(True), admin: dict = Depends(require_admin)):
    valid = ["mobile", "email", "qualification_submitted", "credential", "clinic", "organisation"]
    if level not in valid:
        raise HTTPException(status_code=400, detail="Invalid level")
    await db.users.update_one({"id": user_id}, {"$set": {f"verification.{level}": value}})
    return {"success": True}


@api_router.get("/admin/applications")
async def admin_applications(admin: dict = Depends(require_admin)):
    return await db.applications.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.get("/")
async def root():
    return {"message": "Dental Opportunity Hub API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000"), "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- Seeding ----------------
from seed_data import seed_all  # noqa: E402


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    await db.opportunities.create_index("id", unique=True)
    await seed_all(db, hash_password, default_verification, now_utc)


@app.on_event("shutdown")
async def shutdown():
    client.close()

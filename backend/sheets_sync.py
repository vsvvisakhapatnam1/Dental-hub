"""Google Sheets sync for registrations (non-blocking).

Activates automatically when GOOGLE_SERVICE_ACCOUNT_JSON and GOOGLE_SHEET_ID
are set in the environment. Until then, all functions are safe no-ops so that
registration always succeeds.

Two tabs are maintained inside the spreadsheet ("customer list"):
  - "Seeker list"  -> every seeker registration
  - "Giver list"   -> every giver registration
"""
import os
import json
import logging

logger = logging.getLogger("dental_hub.sheets")

SEEKER_TAB = "Seeker list"
GIVER_TAB = "Giver list"

SEEKER_HEADERS = [
    "Registered At", "Name", "Email", "Phone", "Profile Type", "Qualification",
    "Speciality", "Experience", "City", "State", "Country", "Pincode", "Address", "Preferred Location", "Looking For",
    "Preferred Type", "Availability", "Expected Salary", "Resume/CV", "Summary",
]
GIVER_HEADERS = [
    "Registered At", "Organisation / Name", "Contact Person", "Designation", "Email",
    "Phone", "Website", "City", "State", "Country", "Preferred Location", "Address", "Offering",
    "Specialities", "Facilities", "Established", "Chairs", "Summary",
]


def _load_credentials():
    raw = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
    if not raw:
        return None
    try:
        if os.path.isfile(raw):
            with open(raw, "r") as f:
                info = json.load(f)
        else:
            info = json.loads(raw)
        from google.oauth2.service_account import Credentials
        scopes = ["https://www.googleapis.com/auth/spreadsheets"]
        return Credentials.from_service_account_info(info, scopes=scopes)
    except Exception as e:
        logger.warning(f"[sheets] could not load service account credentials: {e}")
        return None


def is_configured() -> bool:
    return bool(os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
                and os.environ.get("GOOGLE_SHEET_ID", "").strip())


def _row_from_user(user: dict, is_giver: bool):
    j = lambda v: ", ".join(v) if isinstance(v, list) else (v or "")
    if is_giver:
        return [
            user.get("created_at", ""), user.get("org_name") or user.get("name", ""),
            user.get("contact_person", ""), user.get("designation", ""), user.get("email", ""),
            user.get("phone", ""), user.get("website", ""), user.get("city", ""),
            user.get("state", ""), user.get("country", ""), user.get("preferred_location", ""), user.get("address", ""),
            j(user.get("offering")), j(user.get("specialities")), j(user.get("facilities")),
            str(user.get("established") or ""), str(user.get("chairs") or ""), user.get("summary", ""),
        ]
    return [
        user.get("created_at", ""), user.get("name", ""), user.get("email", ""),
        user.get("phone", ""), user.get("profile_type", ""), user.get("qualification", ""),
        user.get("speciality", ""), user.get("experience", ""), user.get("city", ""),
        user.get("state", ""), user.get("country", ""), user.get("pincode", ""), user.get("address", ""),
        user.get("preferred_location", ""), j(user.get("looking_for")),
        user.get("preferred_type", ""), user.get("availability", ""),
        str(user.get("expected_salary") or ""), user.get("cv_filename", ""), user.get("summary", ""),
    ]


def _sync_blocking(user: dict, is_giver: bool):
    creds = _load_credentials()
    sheet_id = os.environ.get("GOOGLE_SHEET_ID", "").strip()
    if not creds or not sheet_id:
        return
    from googleapiclient.discovery import build
    service = build("sheets", "v4", credentials=creds, cache_discovery=False)
    ss = service.spreadsheets()

    meta = ss.get(spreadsheetId=sheet_id).execute()
    existing = {s["properties"]["title"] for s in meta.get("sheets", [])}

    # Ensure both tabs exist
    requests = []
    for tab in (SEEKER_TAB, GIVER_TAB):
        if tab not in existing:
            requests.append({"addSheet": {"properties": {"title": tab}}})
    if requests:
        ss.batchUpdate(spreadsheetId=sheet_id, body={"requests": requests}).execute()

    tab = GIVER_TAB if is_giver else SEEKER_TAB
    headers = GIVER_HEADERS if is_giver else SEEKER_HEADERS

    # Ensure header row present
    current = ss.values().get(spreadsheetId=sheet_id, range=f"'{tab}'!A1:Z1").execute().get("values", [])
    if not current:
        ss.values().update(
            spreadsheetId=sheet_id, range=f"'{tab}'!A1",
            valueInputOption="RAW", body={"values": [headers]},
        ).execute()

    ss.values().append(
        spreadsheetId=sheet_id, range=f"'{tab}'!A1",
        valueInputOption="RAW", insertDataOption="INSERT_ROWS",
        body={"values": [_row_from_user(user, is_giver)]},
    ).execute()
    logger.info(f"[sheets] appended registration to '{tab}' for {user.get('email')}")


async def sync_registration(user: dict):
    """Append a registration row to the correct tab. Never raises."""
    import asyncio
    if not is_configured():
        return
    is_giver = user.get("role") == "giver"
    try:
        await asyncio.to_thread(_sync_blocking, user, is_giver)
    except Exception as e:
        logger.warning(f"[sheets] sync failed (non-blocking): {e}")

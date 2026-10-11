import os
import re
import logging
import httpx

logger = logging.getLogger("dental_hub.whatsapp")


def is_configured() -> bool:
    return bool(os.environ.get("META_ACCESS_TOKEN", "").strip() and os.environ.get("META_PHONE_NUMBER_ID", "").strip())


def normalize_in(phone: str) -> str | None:
    digits = re.sub(r"\D", "", phone or "")
    if digits.startswith("0") and len(digits) == 11:
        digits = digits[1:]
    if len(digits) == 10:
        digits = "91" + digits
    if digits.startswith("91") and len(digits) == 12 and digits[2] in "6789":
        return "+" + digits
    return None


async def send_registration_thanks(phone: str, name: str) -> str:
    to = normalize_in(phone)
    if not to:
        raise ValueError("invalid Indian mobile number")
    url = (f"https://graph.facebook.com/{os.environ['META_GRAPH_API_VERSION']}/"
           f"{os.environ['META_PHONE_NUMBER_ID']}/messages")
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "template",
        "template": {
            "name": os.environ["META_TEMPLATE_NAME"],
            "language": {"code": os.environ["META_TEMPLATE_LANGUAGE"]},
            "components": [{"type": "body", "parameters": [{"type": "text", "text": (name or "there")[:60]}]}],
        },
    }
    async with httpx.AsyncClient(timeout=15) as hc:
        r = await hc.post(url, headers={"Authorization": f"Bearer {os.environ['META_ACCESS_TOKEN']}"}, json=payload)
    if r.is_error:
        raise RuntimeError(f"Meta HTTP {r.status_code}: {r.text[:300]}")
    return r.json()["messages"][0]["id"]

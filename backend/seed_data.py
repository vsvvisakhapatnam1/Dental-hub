import os

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "vsv.visakhapatnam@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "DentalHub@2026")

DEMO_DENTISTS = [
    {"name": "Dr. Priya Nair", "profile_type": "BDS Dentist", "city": "Hyderabad", "state": "Telangana",
     "qualification": "BDS", "speciality": "General Dentistry", "experience": "0-2 years",
     "skills": ["Restorations", "Scaling", "Extractions"], "availability": "Immediately",
     "preferred_type": "Full-time", "looking_for": ["Dental Job", "Associate Position"],
     "summary": "Recent BDS graduate seeking an associate dentist role in Hyderabad. Comfortable with routine restorative and preventive procedures.",
     "verification": {"mobile": True, "email": True, "qualification_submitted": True, "credential": True, "clinic": False, "organisation": False}},
    {"name": "Dr. Arjun Mehta", "profile_type": "MDS Dentist", "city": "Bengaluru", "state": "Karnataka",
     "qualification": "MDS", "speciality": "Orthodontics", "experience": "5-10 years",
     "skills": ["Braces", "Aligners", "Cephalometrics"], "availability": "Within 30 days",
     "preferred_type": "Visiting", "looking_for": ["Visiting Consultant", "Practice Partner"],
     "summary": "Orthodontist with 7 years experience looking for visiting consultant arrangements and practice partnerships across Bengaluru.",
     "verification": {"mobile": True, "email": True, "qualification_submitted": True, "credential": True, "clinic": False, "organisation": False}},
    {"name": "Dr. Sneha Reddy", "profile_type": "MDS Dentist", "city": "Chennai", "state": "Tamil Nadu",
     "qualification": "MDS", "speciality": "Endodontics", "experience": "2-5 years",
     "skills": ["Root Canal", "Microscopy", "Retreatment"], "availability": "Within 15 days",
     "preferred_type": "Part-time", "looking_for": ["Consultant Position", "Dental Job"],
     "summary": "Endodontist offering microscopic RCT services on a part-time / consultant basis in Chennai.",
     "verification": {"mobile": True, "email": True, "qualification_submitted": True, "credential": False, "clinic": False, "organisation": False}},
    {"name": "Dr. Kabir Singh", "profile_type": "Dental Specialist", "city": "Delhi", "state": "Delhi NCR",
     "qualification": "MDS", "speciality": "Oral & Maxillofacial Surgery", "experience": "10+ years",
     "skills": ["Implants", "Wisdom Surgery", "Trauma"], "availability": "1-3 months",
     "preferred_type": "Visiting", "looking_for": ["Visiting Consultant", "Abroad Opportunity"],
     "summary": "Senior maxillofacial surgeon exploring visiting consultant and international opportunities.",
     "verification": {"mobile": True, "email": True, "qualification_submitted": True, "credential": True, "clinic": False, "organisation": False}},
    {"name": "Dr. Ananya Ghosh", "profile_type": "Dental Student", "city": "Pune", "state": "Maharashtra",
     "qualification": "BDS", "speciality": "General Dentistry", "experience": "Fresher",
     "skills": ["Diagnosis", "Prophylaxis"], "availability": "Immediately",
     "preferred_type": "Full-time", "looking_for": ["MDS Admission", "Skill Development Course", "Dental Job"],
     "summary": "Final-year BDS student looking for MDS admission guidance, certification courses and entry-level opportunities.",
     "verification": {"mobile": True, "email": True, "qualification_submitted": False, "credential": False, "clinic": False, "organisation": False}},
    {"name": "Dr. Rahul Verma", "profile_type": "BDS Dentist", "city": "Mumbai", "state": "Maharashtra",
     "qualification": "BDS", "speciality": "Prosthodontics", "experience": "2-5 years",
     "skills": ["Crowns", "Dentures", "Veneers"], "availability": "Within 30 days",
     "preferred_type": "Partnership", "looking_for": ["Practice Partnership", "Clinic Space"],
     "summary": "Prosthodontics-focused dentist seeking a clinic partnership or shared clinic space in Mumbai.",
     "verification": {"mobile": True, "email": True, "qualification_submitted": True, "credential": False, "clinic": False, "organisation": False}},
]

DEMO_CLINICS = [
    {"name": "SmileCare Dental Studio", "org_name": "SmileCare Dental Studio", "city": "Hyderabad", "state": "Telangana",
     "contact_person": "Dr. Meera Rao", "designation": "Clinical Director",
     "specialities": ["General Dentistry", "Orthodontics", "Endodontics"],
     "facilities": ["Digital X-Ray", "OPG", "RVG", "2 Dental Chairs"], "established": "2015", "chairs": "3",
     "summary": "A modern multi-speciality dental studio in Hyderabad hiring associate dentists and visiting specialists.",
     "verification": {"mobile": True, "email": True, "qualification_submitted": False, "credential": False, "clinic": True, "organisation": False}},
    {"name": "DentPro Multispeciality Clinic", "org_name": "DentPro Multispeciality Clinic", "city": "Bengaluru", "state": "Karnataka",
     "contact_person": "Dr. Sanjay Kumar", "designation": "Owner",
     "specialities": ["Implantology", "Periodontics", "Prosthodontics"],
     "facilities": ["CBCT", "Implant Suite", "Sterilization Unit"], "established": "2012", "chairs": "5",
     "summary": "Established implant and perio centre offering practice partnership and visiting consultant slots.",
     "verification": {"mobile": True, "email": True, "qualification_submitted": False, "credential": False, "clinic": True, "organisation": True}},
    {"name": "Coastal Dental Institute", "org_name": "Coastal Dental Institute", "city": "Chennai", "state": "Tamil Nadu",
     "contact_person": "Dr. Lakshmi Iyer", "designation": "Academic Head",
     "specialities": ["Oral Surgery", "Pedodontics"],
     "facilities": ["Lecture Hall", "Simulation Lab", "10 Dental Chairs"], "established": "2008", "chairs": "10",
     "summary": "Dental institution offering MDS opportunities, fellowships and certification courses.",
     "verification": {"mobile": True, "email": True, "qualification_submitted": False, "credential": False, "clinic": True, "organisation": True}},
    {"name": "Precision Dental Lab", "org_name": "Precision Dental Lab", "city": "Mumbai", "state": "Maharashtra",
     "contact_person": "Mr. Anil Kapoor", "designation": "Lab Manager",
     "specialities": ["Prosthodontics"],
     "facilities": ["CAD/CAM Milling", "Zirconia Furnace"], "established": "2018", "chairs": "0",
     "summary": "Full-service dental lab offering crowns, bridges, aligners and equipment to clinics across India.",
     "verification": {"mobile": True, "email": True, "qualification_submitted": False, "credential": False, "clinic": False, "organisation": True}},
]

DEMO_OPPORTUNITIES = [
    {"mode": "offering", "category": "Associate Dentist", "title": "Associate Dentist (BDS) — Full Time",
     "org_ref": "SmileCare Dental Studio", "city": "Hyderabad", "state": "Telangana", "speciality": "General Dentistry",
     "qualification": "BDS", "experience": "0-2 years", "employment_type": "Full-time",
     "compensation": "₹30,000 - ₹45,000 / month", "requirements": "Comfortable with restorations, scaling and extractions. Good chairside manner.",
     "perks": "Chair-time incentive, mentorship from senior dentists", "featured": True},
    {"mode": "offering", "category": "Visiting Consultant", "title": "Visiting Endodontist — 2 days/week",
     "org_ref": "DentPro Multispeciality Clinic", "city": "Bengaluru", "state": "Karnataka", "speciality": "Endodontics",
     "qualification": "MDS", "experience": "2-5 years", "employment_type": "Visiting",
     "compensation": "50% chair-time split", "requirements": "Microscopic RCT experience preferred.",
     "perks": "Dental microscope provided, flexible scheduling", "featured": True},
    {"mode": "offering", "category": "Practice Partnership", "title": "Practice Partnership Opportunity — Implant Centre",
     "org_ref": "DentPro Multispeciality Clinic", "city": "Bengaluru", "state": "Karnataka", "speciality": "Implantology",
     "qualification": "MDS", "experience": "5-10 years", "employment_type": "Partnership",
     "compensation": "Investment ₹15-25 Lakh, revenue share model", "requirements": "Implantologist willing to co-invest and grow the practice.",
     "perks": "Established patient base, CBCT & implant suite", "featured": False},
    {"mode": "offering", "category": "Clinic Space", "title": "Fully-Equipped Clinic Space for Rent",
     "org_ref": "SmileCare Dental Studio", "city": "Hyderabad", "state": "Telangana", "speciality": "General Dentistry",
     "qualification": "Any Dental Qualification", "experience": "Fresher", "employment_type": "Part-time",
     "compensation": "₹20,000 / month rent (chair basis)", "requirements": "Ideal for dentists wanting to start independent practice.",
     "perks": "Reception, sterilization and RVG included", "featured": False},
    {"mode": "offering", "category": "MDS Opportunity", "title": "MDS Seats & Fellowship Programs 2026",
     "org_ref": "Coastal Dental Institute", "city": "Chennai", "state": "Tamil Nadu", "speciality": "Oral Surgery",
     "qualification": "BDS", "experience": "Fresher", "employment_type": "Full-time",
     "compensation": "As per institute norms", "requirements": "Valid BDS, NEET MDS qualified.",
     "perks": "Fellowship in oral surgery and pedodontics", "featured": True},
    {"mode": "offering", "category": "Course", "title": "Hands-on Implantology Certification Course",
     "org_ref": "Coastal Dental Institute", "city": "Chennai", "state": "Tamil Nadu", "speciality": "Implantology",
     "qualification": "BDS", "experience": "0-2 years", "employment_type": "Part-time",
     "compensation": "Course fee ₹85,000", "requirements": "Open to BDS/MDS dentists.",
     "perks": "Live patient hands-on, certificate on completion", "featured": False},
    {"mode": "offering", "category": "Dental Lab", "title": "Zirconia Crowns & Aligner Lab Services",
     "org_ref": "Precision Dental Lab", "city": "Mumbai", "state": "Maharashtra", "speciality": "Prosthodontics",
     "qualification": "Any Dental Qualification", "experience": "Fresher", "employment_type": "Remote",
     "compensation": "Per-unit pricing from ₹1,200", "requirements": "For clinics needing reliable lab turnaround.",
     "perks": "48-hour turnaround, pan-India shipping", "featured": False},
    {"mode": "offering", "category": "Abroad Opportunity", "title": "Dental Opportunities in Dubai (UAE)",
     "org_ref": "DentPro Multispeciality Clinic", "city": "Delhi", "state": "Delhi NCR", "speciality": "General Dentistry",
     "qualification": "BDS", "experience": "2-5 years", "employment_type": "Full-time",
     "compensation": "Competitive AED salary", "requirements": "Licensing guidance provided. Verify eligibility independently.",
     "perks": "Relocation support", "featured": False},
    {"mode": "looking", "category": "Job", "title": "BDS Fresher Seeking Associate Role — Hyderabad",
     "org_ref": None, "poster_ref": "Dr. Priya Nair", "city": "Hyderabad", "state": "Telangana", "speciality": "General Dentistry",
     "qualification": "BDS", "experience": "0-2 years", "employment_type": "Full-time",
     "compensation": "Expected ₹30,000+", "requirements": "Looking for a supportive clinic with mentorship.",
     "perks": "", "featured": False},
    {"mode": "looking", "category": "Practice Partner", "title": "Prosthodontist Seeking Clinic Partnership — Mumbai",
     "org_ref": None, "poster_ref": "Dr. Rahul Verma", "city": "Mumbai", "state": "Maharashtra", "speciality": "Prosthodontics",
     "qualification": "BDS", "experience": "2-5 years", "employment_type": "Partnership",
     "compensation": "Open to investment discussion", "requirements": "Prefer prime location clinic seeking a partner.",
     "perks": "", "featured": False},
    {"mode": "looking", "category": "Visiting Consultant", "title": "Orthodontist Available for Visiting Consults — Bengaluru",
     "org_ref": None, "poster_ref": "Dr. Arjun Mehta", "city": "Bengaluru", "state": "Karnataka", "speciality": "Orthodontics",
     "qualification": "MDS", "experience": "5-10 years", "employment_type": "Visiting",
     "compensation": "Chair-time split negotiable", "requirements": "Available 2-3 days a week for ortho cases.",
     "perks": "", "featured": False},
    {"mode": "looking", "category": "Course", "title": "Final-year Student Looking for MDS Guidance & Courses",
     "org_ref": None, "poster_ref": "Dr. Ananya Ghosh", "city": "Pune", "state": "Maharashtra", "speciality": "General Dentistry",
     "qualification": "BDS", "experience": "Fresher", "employment_type": "Part-time",
     "compensation": "-", "requirements": "Seeking certification courses and MDS admission mentorship.",
     "perks": "", "featured": False},
]


async def seed_all(db, hash_password, default_verification, now_utc):
    import uuid
    ts = now_utc().isoformat()

    # Admin (idempotent)
    admin = await db.users.find_one({"email": ADMIN_EMAIL})
    if not admin:
        ver = default_verification()
        ver.update({"mobile": True, "email": True, "organisation": True})
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "email": ADMIN_EMAIL, "password_hash": hash_password(ADMIN_PASSWORD),
            "auth_provider": "email", "name": "Platform Admin", "role": "admin", "profile_type": "Admin",
            "phone": None, "city": None, "state": None, "country": "India", "qualification": None,
            "speciality": None, "experience": None, "skills": [], "looking_for": [], "offering": [],
            "preferred_type": None, "availability": None, "expected_salary": None, "summary": None,
            "org_name": "Dental Opportunity Hub", "contact_person": None, "designation": None, "website": None,
            "address": None, "specialities": [], "facilities": [], "established": None, "chairs": None,
            "photo": None, "verification": ver, "is_demo": False, "created_at": ts,
        })
    else:
        from bcrypt import checkpw
        if not admin.get("password_hash") or not checkpw(ADMIN_PASSWORD.encode(), admin["password_hash"].encode()):
            await db.users.update_one({"email": ADMIN_EMAIL}, {"$set": {"password_hash": hash_password(ADMIN_PASSWORD), "role": "admin"}})

    if await db.opportunities.count_documents({"is_demo": True}) > 0:
        return  # demo already seeded

    name_to_id = {}

    def base_user(role):
        return {
            "id": str(uuid.uuid4()), "auth_provider": "demo", "password_hash": None, "role": role,
            "country": "India", "skills": [], "looking_for": [], "offering": [], "specialities": [],
            "facilities": [], "photo": None, "is_demo": True, "created_at": ts, "phone": "+91 90000 00000",
        }

    for d in DEMO_DENTISTS:
        doc = base_user("seeker")
        doc.update(d)
        doc["email"] = f"{d['name'].lower().replace('dr. ', '').replace(' ', '.').replace('.', '.')}@demo.dentalhub.in".replace("..", ".")
        try:
            await db.users.insert_one(doc)
            name_to_id[d["name"]] = doc["id"]
        except Exception:
            pass

    for c in DEMO_CLINICS:
        doc = base_user("giver")
        doc.update(c)
        doc["offering"] = ["Dental Job", "Visiting Consultant"]
        doc["email"] = f"{c['org_name'].lower().replace(' ', '.')}@demo.dentalhub.in"
        try:
            await db.users.insert_one(doc)
            name_to_id[c["org_name"]] = doc["id"]
        except Exception:
            pass

    for o in DEMO_OPPORTUNITIES:
        ref = o.get("org_ref") or o.get("poster_ref")
        poster_id = name_to_id.get(ref)
        poster = await db.users.find_one({"id": poster_id}) if poster_id else None
        ver = (poster or {}).get("verification", {})
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
            "id": str(uuid.uuid4()), "mode": o["mode"], "category": o["category"], "title": o["title"],
            "description": o.get("requirements", ""), "org_name": ref, "city": o["city"], "state": o["state"],
            "country": "India", "speciality": o["speciality"], "qualification": o["qualification"],
            "experience": o["experience"], "employment_type": o["employment_type"], "compensation": o["compensation"],
            "requirements": o.get("requirements", ""), "perks": o.get("perks", ""),
            "contact_method": "email", "contact_value": (poster or {}).get("email"),
            "poster_id": poster_id, "poster_name": ref, "verification_status": vstatus,
            "status": "published", "featured": o.get("featured", False), "is_demo": True, "created_at": ts,
        }
        await db.opportunities.insert_one(doc)

    # one pending opportunity for admin moderation demo
    await db.opportunities.insert_one({
        "id": str(uuid.uuid4()), "mode": "offering", "category": "Dental Assistant", "title": "Dental Assistant Wanted (Pending Review)",
        "description": "Assistant needed for a busy clinic.", "org_name": "SmileCare Dental Studio", "city": "Hyderabad",
        "state": "Telangana", "country": "India", "speciality": "General Dentistry", "qualification": "Any Dental Qualification",
        "experience": "Fresher", "employment_type": "Full-time", "compensation": "₹15,000 / month",
        "requirements": "Basic chairside assisting.", "perks": "On-the-job training", "contact_method": "email",
        "contact_value": None, "poster_id": name_to_id.get("SmileCare Dental Studio"), "poster_name": "SmileCare Dental Studio",
        "verification_status": "clinic", "status": "pending", "featured": False, "is_demo": True, "created_at": ts,
    })

export const LOOKING_CATEGORIES = [
  "Job", "Associate Dentist", "Consultant Position", "Visiting Consultant", "Dental Assistant",
  "Clinic Space", "Practice Location", "Practice Partner", "Practice Partnership",
  "MDS Admission", "Fellowship", "Course", "Certification", "Skill Development",
  "Abroad Opportunity", "Dental Service", "Dental Lab", "Equipment", "Other Opportunity",
];

export const OFFERING_CATEGORIES = [
  "Dentist Job", "Associate Dentist", "Consultant Position", "Specialist Position", "Visiting Consultant",
  "Dental Assistant", "Clinic Space", "Practice Partnership", "Practice Collaboration", "Practice for Sale/Transfer",
  "MDS Opportunity", "Course", "Fellowship", "Certification", "Training",
  "Abroad Opportunity", "Dental Service", "Dental Lab", "Equipment", "Other Opportunity",
];

export const ALL_CATEGORIES = Array.from(new Set([...LOOKING_CATEGORIES, ...OFFERING_CATEGORIES]));

export const SPECIALITIES = [
  "General Dentistry", "Orthodontics", "Prosthodontics", "Periodontics", "Endodontics",
  "Oral & Maxillofacial Surgery", "Implantology", "Pedodontics", "Oral Medicine & Radiology",
  "Oral Pathology", "Public Health Dentistry",
];

export const QUALIFICATIONS = ["BDS", "MDS", "Any Dental Qualification", "Other"];

export const EXPERIENCE_LEVELS = ["Fresher", "0-2 years", "2-5 years", "5-10 years", "10+ years"];

export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Visiting", "Freelance", "Partnership", "Remote"];

export const AVAILABILITY = ["Immediately", "Within 15 days", "Within 30 days", "1-3 months"];

export const STATES = [
  "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra", "Delhi NCR", "Gujarat",
  "Kerala", "West Bengal", "Uttar Pradesh", "Rajasthan", "Punjab", "Andhra Pradesh",
];

export const CITIES = [
  "Hyderabad", "Bengaluru", "Chennai", "Mumbai", "Pune", "Delhi", "Ahmedabad",
  "Kochi", "Kolkata", "Jaipur", "Chandigarh", "Visakhapatnam",
];

export const SEEKER_PROFILE_TYPES = [
  "Dental Student", "BDS Dentist", "MDS Dentist", "Dental Specialist",
  "Dental Assistant", "Dental Professional", "Dental Entrepreneur", "Other",
];

export const GIVER_PROFILE_TYPES = [
  "Dental Clinic", "Dentist / Professional", "Dental Hospital", "Dental College / Institution",
  "Training Provider", "Dental Lab", "Dental Equipment Provider", "Dental Service Provider",
  "Recruitment Agency", "Organisation / Company", "Other",
];

export const VERIFICATION_LEVELS = [
  { key: "mobile", label: "Mobile Verified" },
  { key: "email", label: "Email Verified" },
  { key: "qualification_submitted", label: "Qualification Submitted" },
  { key: "credential", label: "Professional Credential Verified" },
  { key: "clinic", label: "Clinic Verified" },
  { key: "organisation", label: "Organisation Verified" },
];

export const PREFERRED_LOCATIONS = [...CITIES, "Anywhere in India", "Abroad"];

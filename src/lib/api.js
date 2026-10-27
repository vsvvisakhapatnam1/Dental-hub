import {
  INITIAL_DENTISTS,
  INITIAL_CLINICS,
  INITIAL_OPPORTUNITIES,
  INITIAL_PACKAGES,
  INITIAL_USER,
} from "./mockData";

const STORAGE_KEYS = {
  TOKEN: "doh_token",
  USER: "doh_user",
  OPPORTUNITIES: "doh_opportunities",
  APPLICATIONS: "doh_applications",
  DENTISTS: "doh_dentists",
  CLINICS: "doh_clinics",
  CONTACTS: "doh_contacts",
};

// Safe LocalStorage helpers
function getItem(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key, val) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore storage quota */
  }
}

// Initialize mock store
export function getStore() {
  const opps = getItem(STORAGE_KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
  const dentists = getItem(STORAGE_KEYS.DENTISTS, INITIAL_DENTISTS);
  const clinics = getItem(STORAGE_KEYS.CLINICS, INITIAL_CLINICS);
  const apps = getItem(STORAGE_KEYS.APPLICATIONS, []);
  let user = getItem(STORAGE_KEYS.USER, null);

  // Default to a signed-in demo user if none exists
  if (!user) {
    user = INITIAL_USER;
    setItem(STORAGE_KEYS.USER, user);
  }

  return { opps, dentists, clinics, apps, user };
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }
}

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

// Core API Simulation Router
async function handleApiCall(method, url, data = null, config = {}) {
  // Simulate natural brief async delay (30-80ms)
  await new Promise((resolve) => setTimeout(resolve, 40));

  const cleanUrl = url.split("?")[0].replace(/^\/api/, "");
  const params = config?.params || {};
  const { opps, dentists, clinics, apps, user } = getStore();

  // Helper matching
  const match = (pattern) => {
    const regex = new RegExp(`^${pattern.replace(/:[a-zA-Z0-9_]+/g, "([^/]+)")}$`);
    return cleanUrl.match(regex);
  };

  // --- Auth endpoints ---
  if (cleanUrl === "/auth/me") {
    return { data: user || INITIAL_USER };
  }

  if (cleanUrl === "/auth/login") {
    const email = data?.email || "admin@dentalhubpro.com";
    const loggedUser = {
      ...INITIAL_USER,
      email,
      name: email.split("@")[0].replace(".", " "),
      role: email.includes("admin") ? "admin" : "seeker",
    };
    setItem(STORAGE_KEYS.USER, loggedUser);
    setItem(STORAGE_KEYS.TOKEN, "demo_jwt_token_" + Date.now());
    return { data: { ...loggedUser, session_token: "demo_jwt_token" } };
  }

  if (cleanUrl === "/auth/register") {
    const newUser = {
      id: "user-" + Date.now(),
      email: data.email,
      name: data.name || data.email.split("@")[0],
      role: data.role || "seeker",
      profile_type: data.profile_type || (data.role === "giver" ? "Dental Clinic" : "BDS Dentist"),
      city: data.city || "Hyderabad",
      state: data.state || "Telangana",
      country: "India",
      qualification: data.qualification || "BDS",
      speciality: data.speciality || "General Dentistry",
      org_name: data.org_name || (data.role === "giver" ? data.name : null),
      phone: data.phone || "+91 90000 00000",
      verification: {
        mobile: true,
        email: true,
        qualification_submitted: false,
        credential: false,
        clinic: data.role === "giver",
        organisation: false,
      },
    };
    setItem(STORAGE_KEYS.USER, newUser);
    setItem(STORAGE_KEYS.TOKEN, "demo_jwt_token_" + Date.now());

    if (newUser.role === "seeker") {
      setItem(STORAGE_KEYS.DENTISTS, [newUser, ...dentists]);
    } else {
      setItem(STORAGE_KEYS.CLINICS, [newUser, ...clinics]);
    }

    return { data: { ...newUser, session_token: "demo_jwt_token" } };
  }

  if (cleanUrl === "/auth/logout") {
    setItem(STORAGE_KEYS.USER, null);
    setToken(null);
    return { data: { ok: true } };
  }

  if (cleanUrl === "/auth/profile") {
    const updated = { ...user, ...(data || {}) };
    setItem(STORAGE_KEYS.USER, updated);
    return { data: updated };
  }

  if (cleanUrl === "/auth/forgot-password" || cleanUrl === "/auth/reset-password") {
    return { data: { ok: true, message: "Password reset link processed successfully." } };
  }

  if (cleanUrl === "/auth/google/session") {
    return { data: { ...INITIAL_USER, session_token: "demo_google_token" } };
  }

  // --- Opportunities endpoints ---
  if (cleanUrl === "/opportunities") {
    if (method === "GET") {
      let filtered = [...opps];

      if (params.mode) {
        filtered = filtered.filter((o) => o.mode === params.mode);
      }
      if (params.category && params.category !== "__any__") {
        filtered = filtered.filter((o) =>
          o.category.toLowerCase().includes(params.category.toLowerCase())
        );
      }
      if (params.speciality && params.speciality !== "__any__") {
        filtered = filtered.filter((o) =>
          (o.speciality || "").toLowerCase().includes(params.speciality.toLowerCase())
        );
      }
      if (params.city && params.city !== "__any__") {
        filtered = filtered.filter((o) =>
          (o.city || "").toLowerCase().includes(params.city.toLowerCase())
        );
      }
      if (params.state && params.state !== "__any__") {
        filtered = filtered.filter((o) =>
          (o.state || "").toLowerCase().includes(params.state.toLowerCase())
        );
      }
      if (params.q) {
        const query = params.q.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.title.toLowerCase().includes(query) ||
            (o.description || "").toLowerCase().includes(query) ||
            (o.org_name || "").toLowerCase().includes(query)
        );
      }
      if (params.limit) {
        filtered = filtered.slice(0, Number(params.limit));
      }
      return { data: filtered };
    }

    if (method === "POST") {
      const newOpp = {
        id: "opp-" + Date.now(),
        ...data,
        poster_id: user?.id || "user-1",
        poster_name: user?.name || user?.org_name || "Dental Practitioner",
        status: "published",
        featured: data?.featured || false,
        created_at: new Date().toISOString(),
      };
      const updated = [newOpp, ...opps];
      setItem(STORAGE_KEYS.OPPORTUNITIES, updated);
      return { data: newOpp };
    }
  }

  // Opportunity single /:id
  let m = match("/opportunities/:id");
  if (m) {
    const oppId = m[1];
    if (method === "GET") {
      const found = opps.find((o) => o.id === oppId);
      if (found) return { data: found };
      return { data: opps[0] }; // fallback to first item
    }
    if (method === "DELETE") {
      const updated = opps.filter((o) => o.id !== oppId);
      setItem(STORAGE_KEYS.OPPORTUNITIES, updated);
      return { data: { ok: true } };
    }
  }

  // Apply to opportunity
  if (cleanUrl === "/applications") {
    if (method === "POST") {
      const newApp = {
        id: "app-" + Date.now(),
        opportunity_id: data.opportunity_id,
        applicant_id: user?.id || "user-applicant",
        applicant_name: user?.name || "Dr. Applicant",
        message: data.message || "",
        created_at: new Date().toISOString(),
      };
      const updatedApps = [newApp, ...apps];
      setItem(STORAGE_KEYS.APPLICATIONS, updatedApps);
      return { data: newApp };
    }
  }

  // Dashboard endpoints
  if (cleanUrl === "/my/opportunities") {
    const myOpps = opps.filter(
      (o) => o.poster_id === user?.id || o.org_name === user?.org_name
    );
    return { data: myOpps.length > 0 ? myOpps : opps.slice(0, 3) };
  }

  if (cleanUrl === "/my/applications") {
    return { data: apps };
  }

  m = match("/opportunities/:id/applications");
  if (m) {
    const oppId = m[1];
    const related = apps.filter((a) => a.opportunity_id === oppId);
    return { data: related };
  }

  // Directory endpoints
  if (cleanUrl === "/directory/dentists") {
    let list = [...dentists];
    if (params.speciality && params.speciality !== "__any__") {
      list = list.filter((d) =>
        (d.speciality || "").toLowerCase().includes(params.speciality.toLowerCase())
      );
    }
    if (params.city && params.city !== "__any__") {
      list = list.filter((d) =>
        (d.city || "").toLowerCase().includes(params.city.toLowerCase())
      );
    }
    if (params.q) {
      const q = params.q.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.skills || []).some((s) => s.toLowerCase().includes(q))
      );
    }
    return { data: list };
  }

  if (cleanUrl === "/directory/clinics") {
    let list = [...clinics];
    if (params.speciality && params.speciality !== "__any__") {
      list = list.filter((c) =>
        (c.specialities || []).some((s) =>
          s.toLowerCase().includes(params.speciality.toLowerCase())
        )
      );
    }
    if (params.city && params.city !== "__any__") {
      list = list.filter((c) =>
        (c.city || "").toLowerCase().includes(params.city.toLowerCase())
      );
    }
    if (params.q) {
      const q = params.q.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.org_name || "").toLowerCase().includes(q)
      );
    }
    return { data: list };
  }

  m = match("/directory/user/:id");
  if (m) {
    const uid = m[1];
    const person =
      dentists.find((d) => d.id === uid) ||
      clinics.find((c) => c.id === uid) ||
      (user?.id === uid ? user : dentists[0]);
    return { data: person };
  }

  // Payments
  if (cleanUrl === "/payments/packages") {
    return { data: INITIAL_PACKAGES };
  }

  if (cleanUrl === "/payments/checkout") {
    return { data: { checkout_url: "/payment/success?session_id=demo_session_123" } };
  }

  m = match("/payments/status/:id");
  if (m) {
    return { data: { status: "complete", payment_id: "pay_" + Date.now() } };
  }

  // File Upload
  if (cleanUrl === "/upload") {
    return { data: { url: "https://assets.dentalhubpro.com/cv/demo-cv.pdf", filename: "cv.pdf" } };
  }

  // Contact
  if (cleanUrl === "/contact") {
    return { data: { ok: true, message: "Thank you! Your message has been received." } };
  }

  // Admin Endpoints
  if (cleanUrl === "/admin/stats") {
    return {
      data: {
        users: dentists.length + clinics.length + 15,
        dentists: dentists.length + 8,
        clinics: clinics.length + 7,
        opportunities: opps.length,
        applications: apps.length + 24,
      },
    };
  }

  if (cleanUrl === "/admin/opportunities") {
    return { data: opps };
  }

  if (cleanUrl === "/admin/users") {
    return { data: [...dentists, ...clinics] };
  }

  if (cleanUrl === "/admin/applications") {
    return { data: apps };
  }

  m = match("/admin/opportunities/:id/status");
  if (m) {
    const oppId = m[1];
    const st = params.status || "published";
    const updated = opps.map((o) => (o.id === oppId ? { ...o, status: st } : o));
    setItem(STORAGE_KEYS.OPPORTUNITIES, updated);
    return { data: { ok: true } };
  }

  m = match("/admin/opportunities/:id/feature");
  if (m) {
    const oppId = m[1];
    const feat = params.featured === true || params.featured === "true";
    const updated = opps.map((o) => (o.id === oppId ? { ...o, featured: feat } : o));
    setItem(STORAGE_KEYS.OPPORTUNITIES, updated);
    return { data: { ok: true } };
  }

  m = match("/admin/users/:uid/verify");
  if (m) {
    const uid = m[1];
    const { level, value } = params;
    const updateVerification = (list, key) => {
      const next = list.map((item) => {
        if (item.id === uid) {
          return {
            ...item,
            verification: { ...(item.verification || {}), [level]: value === "true" || value === true },
          };
        }
        return item;
      });
      setItem(key, next);
    };
    updateVerification(dentists, STORAGE_KEYS.DENTISTS);
    updateVerification(clinics, STORAGE_KEYS.CLINICS);
    return { data: { ok: true } };
  }

  if (cleanUrl === "/admin/sheets/status") {
    return { data: { connected: true, last_synced: new Date().toISOString(), total_synced: 142 } };
  }

  if (cleanUrl === "/admin/sheets/sync") {
    return { data: { pending: 0, synced: true } };
  }

  if (cleanUrl === "/admin/confidential") {
    return { data: { authorized: true, token: "confidential_token" } };
  }

  if (cleanUrl === "/admin/confidential/logs") {
    return {
      data: [
        { id: "log-1", action: "User Verification Approved", admin: "Dr. Satish", time: "2026-02-26 14:30" },
        { id: "log-2", action: "Opportunity Featured", admin: "Dr. Satish", time: "2026-02-25 11:15" },
        { id: "log-3", action: "System Backup Completed", admin: "Automated", time: "2026-02-24 00:00" },
      ],
    };
  }

  // Default fallback
  return { data: { ok: true } };
}

// Full API client interface matching Axios
const api = {
  defaults: {
    headers: {
      common: {},
    },
  },
  get: (url, config) => handleApiCall("GET", url, null, config),
  post: (url, data, config) => handleApiCall("POST", url, data, config),
  put: (url, data, config) => handleApiCall("PUT", url, data, config),
  delete: (url, config) => handleApiCall("DELETE", url, null, config),
  patch: (url, data, config) => handleApiCall("PATCH", url, data, config),
};

export const API = "/api";
export default api;

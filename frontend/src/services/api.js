import axios from "axios";

const getBaseURL = () => {
  if (typeof window !== "undefined" && window.location?.hostname) {
    const envUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1") && !envUrl.match(/^https?:\/\/\d+\.\d+\.\d+\.\d+/)) {
      return envUrl.replace(/\/+$/, "");
    }
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }
  return "http://localhost:8080";
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: { "Content-Type": "application/json" },
});

const normalizeRole = (role) => (role || "").toLowerCase();

const mapProperty = (p = {}) => ({
  ...p,
  id: p.id ?? p.property_id,
  title: p.title ?? p.address,
  bedrooms: p.bedrooms ?? p.no_of_bedrooms,
  agentName: p.agentName ?? p.agent_name,
  agentId: p.agentId ?? p.agent_id,
  ownerName: p.ownerName ?? p.owner_name,
  rating: p.rating ?? p.agent_rating,
});

const mapUser = (u = {}, roleHint = "") => ({
  ...u,
  id: u.id ?? u.owner_id ?? u.buyer_id ?? u.agent_id ?? u.admin_id ?? u.refId,
  name: u.name ?? u.owner_name ?? u.buyer_name ?? u.agent_name ?? "",
  role: normalizeRole(u.role || roleHint),
});

const mapRequest = (r = {}) => ({
  ...r,
  id: r.id ?? r.request_id,
  status: normalizeRequestStatus(r.status),
  type: r.type ?? (r.request_type === "buy" ? "sale" : r.request_type === "rent" ? "rent" : r.prop_type),
  buyerName: r.buyerName ?? r.buyer_name,
  buyerEmail: r.buyerEmail ?? r.buyer_email,
  propertyAddress: r.propertyAddress ?? r.address,
  propertyId: r.propertyId ?? r.property_id,
  agentName: r.agentName ?? r.agent_name,
});

const normalizeRequestStatus = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "ACCEPTED") return "approved";
  if (s === "REJECTED") return "rejected";
  if (s === "VISIT_SCHEDULED") return "visit_scheduled";
  return "pending";
};

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  login: async ({ email, password, role }) => {
    const res = await API.post("/api/auth/login", { email, password, role });
    return {
      ...res,
      data: mapUser(res.data, res.data.role),
    };
  },
  register: async (data) => {
    const role = normalizeRole(data.role);
    if (role === "owner") {
      const res = await API.post("/api/auth/register/owner", {
        name: data.name,
        email: data.email,
        password: data.password,
        contactNo: data.contactNo || data.phone || "0000000000",
      });
      return { ...res, data: mapUser(res.data, "owner") };
    }
    if (role === "buyer") {
      const res = await API.post("/api/auth/register/buyer", {
        name: data.name,
        email: data.email,
        password: data.password,
        contactNo: data.contactNo || data.phone || "0000000000",
        category: data.category || "buy",
      });
      return { ...res, data: mapUser(res.data, "buyer") };
    }
    throw new Error("Registration is available only for owner and buyer in this backend.");
  },
};

export const propertyApi = {
  getAll: async (params = {}) => {
    const res = await API.get("/api/buyer/browse", {
      params: params.type && params.type !== "all" ? { type: params.type } : {},
    });
    let items = Array.isArray(res.data) ? res.data.map(mapProperty) : [];
    if (params.city) {
      const q = params.city.toLowerCase();
      items = items.filter((p) => String(p.city || "").toLowerCase().includes(q));
    }
    if (params.maxPrice) {
      const max = Number(params.maxPrice);
      if (!Number.isNaN(max)) items = items.filter((p) => Number(p.price || 0) <= max);
    }
    return { ...res, data: items };
  },
  getById: async (id) => {
    const res = await API.get("/api/buyer/browse");
    const item = (Array.isArray(res.data) ? res.data : []).map(mapProperty).find((p) => String(p.id) === String(id));
    return { ...res, data: item || null };
  },
  getByOwner: async () => {
    const res = await API.get("/api/owner/properties");
    return { ...res, data: (Array.isArray(res.data) ? res.data : []).map(mapProperty) };
  },
  getSoldByOwner: async () => {
    const res = await API.get("/api/owner/properties");
    const items = (Array.isArray(res.data) ? res.data : []).map(mapProperty)
      .filter((p) => p.is_taken || ["SOLD", "RENTED"].includes(String(p.status || "").toUpperCase()));
    return { ...res, data: items };
  },
  getPurchasedByBuyer: async () => {
    const res = await API.get("/api/buyer/my-properties");
    const data = res.data || {};
    return { ...res, _rawData: data, data: [] };
  },
  getByAgent: async () => {
    const res = await API.get("/api/agent/properties");
    return { ...res, data: (Array.isArray(res.data) ? res.data : []).map(mapProperty) };
  },
  create: (data) => API.post("/api/owner/properties", data),
  update: (id, data) => API.put(`/api/properties/${id}`, data),
  delete: (id) => API.delete(`/api/owner/properties/${id}`),
};

export const profileApi = {
  getMe: async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const role = normalizeRole(user?.role);
    let res;
    if (role === "agent") res = await API.get("/api/agent/profile");
    else if (role === "owner") res = await API.get("/api/owner/profile");
    else if (role === "buyer") res = await API.get("/api/buyer/profile");
    else throw new Error("Profile endpoint not available for this role");
    return { ...res, data: mapUser(res.data, role) };
  },
  updateMe: async (data) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const role = normalizeRole(user?.role);
    if (role === "agent") {
      const res = await API.put("/api/agent/profile", data);
      return { ...res, data: mapUser(res.data, role) };
    }
    throw new Error("Profile update is only implemented for agents in this project.");
  },
};

export const requestApi = {
  send: (data) => API.post("/api/buyer/request", {
    propertyId: data.propertyId,
    agentId: data.agentId,
    requestType: data.type === "sale" ? "buy" : "rent",
    message: data.message || "",
  }),
  getForBuyer: async () => {
    const res = await API.get("/api/buyer/requests");
    return { ...res, data: (Array.isArray(res.data) ? res.data : []).map(mapRequest) };
  },
  getForAgent: async () => {
    const res = await API.get("/api/agent/requests");
    return { ...res, data: (Array.isArray(res.data) ? res.data : []).map(mapRequest) };
  },
  updateStatus: (id, status) => API.put(`/api/agent/requests/${id}`, {
    action: status === "approved" ? "ACCEPT" : status === "rejected" ? "REJECT" : String(status || "").toUpperCase(),
  }),
};

export const agentApi = {
  getAll: async () => {
    const res = await API.get("/api/owner/agents");
    return {
      ...res,
      data: (Array.isArray(res.data) ? res.data : []).map((a) => ({
        ...a,
        id: a.id ?? a.agent_id,
        name: a.name ?? a.agent_name,
      })),
    };
  },
};

export const adminApi = {
  getStats: ( ) => API.get("/api/admin/stats"),
  getUsers: async (role) => {
    const r = normalizeRole(role);
    let res;
    if (r === "owner") res = await API.get("/api/admin/owners");
    else if (r === "buyer") res = await API.get("/api/admin/buyers");
    else res = await API.get("/api/admin/agents");
    return { ...res, data: (Array.isArray(res.data) ? res.data : []).map((u) => mapUser(u, r)) };
  },
  removeUser: (id, role) => {
    const r = normalizeRole(role);
    if (r === "owner") return API.delete(`/api/admin/owners/${id}`);
    if (r === "buyer") return API.delete(`/api/admin/buyers/${id}`);
    return API.delete(`/api/admin/agents/${id}`);
  },
  getProperties: async () => {
    const res = await API.get("/api/admin/properties");
    return { ...res, data: (Array.isArray(res.data) ? res.data : []).map(mapProperty) };
  },
  deleteProperty: (id) => API.delete(`/api/admin/properties/${id}`),
  addAgent: (data) => API.post("/api/admin/agents", {
    name: data.name,
    email: data.email,
    password: data.password,
    contactNo: data.contactNo || data.phone || "",
    experience: parseInt(data.experience) || 0,
    bio: data.bio || "",
  }),
  runSql: (sql) => API.post("/api/admin/query", { sql }),
};

export default API;

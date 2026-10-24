const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SEARCH_URL = import.meta.env.VITE_SEARCH_URL || "http://localhost:8000";

async function request(base, path, { method = "GET", body, token } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.detail || `Request failed (${res.status})`);
  return data;
}

// Node.js / Express API
export const api = (path, options) => request(API_URL, path, options);

// Python / FastAPI service
export const searchApi = (path) => request(SEARCH_URL, path);

// Centralized API configuration
// In development, defaults to localhost:5001 if VITE_BACKEND_URL is not set.
// In production (e.g. Vercel unified deployment), defaults to "" (same origin) so requests go to /api/*.
const envBackendUrl = import.meta.env.VITE_BACKEND_URL;

export const API_BASE_URL =
  envBackendUrl !== undefined && envBackendUrl !== ""
    ? envBackendUrl.replace(/\/$/, "")
    : (import.meta.env.DEV ? "http://localhost:5001" : "");

export default API_BASE_URL;

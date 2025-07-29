// Export the base URL for the back end API. When building for production
// you should set the VITE_API_BASE environment variable so the
// front‑end knows where to send requests. During development this
// defaults to an empty string which proxies to the local FastAPI server.
export const API_BASE = import.meta.env.VITE_API_BASE || '';
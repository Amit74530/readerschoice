// src/utils/baseURL.js

/**
 * Dynamically returns the correct base URL for API calls.
 * It checks:
 * 1. If an environment variable (VITE_API_BASE_URL) exists — use that.
 * 2. Otherwise, if running locally, default to localhost:5000.
 * 3. Else, use the current window origin (for deployed frontend + backend on same domain).
 */
const getBaseUrl = () => {
  // 1️⃣ From environment variable (recommended for production)
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (envBase) return envBase;

  // 2️⃣ Localhost fallback (for development)
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }

  // 3️⃣ If deployed on same origin (e.g. yourdomain.com)
  return window.location.origin;
};

export default getBaseUrl;

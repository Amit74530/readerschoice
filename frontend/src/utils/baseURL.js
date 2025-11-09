// src/utils/baseURL.js
const trimTrailingSlash = (s = "") => s.replace(/\/+$/, "");

const getBaseUrl = () => {
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (envBase) return trimTrailingSlash(envBase);

  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  // fallback - remove any trailing slash that might accidentally appear
  return trimTrailingSlash(window.location.origin);
};

export default getBaseUrl;

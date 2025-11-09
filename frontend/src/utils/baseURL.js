// src/utils/baseURL.js
// src/utils/baseURL.js
const trimSlash = (url = "") => url.replace(/\/+$/, ""); // remove trailing slash(es)

const getBaseUrl = () => {
  // ✅ 1. If environment variable is set (Render production)
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (envBase) return trimSlash(envBase);

  // ✅ 2. Local development (localhost)
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000"; // your local backend
  }

  // ✅ 3. Fallback to your deployed backend on Render
  return trimSlash("https://readerschoice-ip2w.onrender.com"); // <-- your actual backend URL
};

export default getBaseUrl;

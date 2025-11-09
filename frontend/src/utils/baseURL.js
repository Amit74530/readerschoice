
// src/utils/baseURL.js
const getBaseUrl = () => {
  // ✅ 1. If environment variable is set (Render production)
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (envBase) return envBase;

  // ✅ 2. Local development (localhost)
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000"; // your local backend
  }

  // ✅ 3. Fallback to your deployed backend on Render
  return "https://your-backend-name.onrender.com"; // <-- replace with your real backend Render URL
};

export default getBaseUrl;

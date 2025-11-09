// src/utils/getImgUrl.js
export const getImgUrl = (name) => {
  if (!name) {
    return "https://placehold.co/240x320/ddd/777?text=No+Image";
  }

  // 1) if it's already a full URL (Cloudinary, S3, etc.)
  if (/^https?:\/\//i.test(name)) {
    return name;
  }

  // 2) if it already looks like a backend path (uploads/ or /uploads/ or images/)
  if (name.startsWith("uploads") || name.startsWith("/uploads") || name.startsWith("images") || name.startsWith("book_covers")) {
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${base.replace(/\/$/, "")}/${String(name).replace(/^\//, "")}`;
  }

  // 3) NEW: if it's a plain filename (no slash) assume it's an upload filename on backend
  if (!name.includes("/")) {
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${base.replace(/\/$/, "")}/uploads/${String(name)}`;
  }

  // 4) fallback: try local static asset (src/assets/books)
  try {
    return new URL(`../assets/books/${name}`, import.meta.url).href;
  } catch (err) {
    return "https://placehold.co/240x320/ddd/777?text=No+Image";
  }
};

export default getImgUrl;

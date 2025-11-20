// src/pages/home/Testimonials.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import getBaseUrl from "../utils/baseURL";
import Swal from "sweetalert2";

// Swiper (only used on mobile)
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const API_BASE = `${getBaseUrl()}/api/testimonials`;

const DisplayStars = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} className={`${n <= rating ? "text-yellow-400" : "text-gray-300"} text-sm`}>★</span>
    ))}
    <span className="text-xs text-gray-400 ml-2">({rating})</span>
  </div>
);

const StarInput = ({ filled, onClick, idx }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Set ${idx} star${idx > 1 ? "s" : ""}`}
    className={`text-xl ${filled ? "text-yellow-400" : "text-gray-300"} focus:outline-none`}
  >
    ★
  </button>
);

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 800 : false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [expanded, setExpanded] = useState({});

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}?limit=24`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch testimonials", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      Swal.fire("Error", "Please add a comment and rating", "error");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { name: name || undefined, email: email || undefined, comment, rating };
      await axios.post(API_BASE, payload);
      await Swal.fire("Thanks!", "Your review was submitted.", "success");
      setName(""); setEmail(""); setComment(""); setRating(5);
      fetchReviews();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.message || "Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch {
      return "";
    }
  };

  const truncate = (text, n = 220) => (text && text.length > n ? text.slice(0, n) + "…" : text);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-sm mb-3">
          Trusted by readers
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">What Our Customers Say</h2>
        <p className="text-gray-600">Handpicked feedback from real readers — short, honest, and helpful.</p>
      </div>

      {/* Reviews grid / carousel */}
      <div className="mb-16">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-paper rounded-xl border p-6 h-48" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-paper rounded-xl border p-8 text-center text-gray-600">No reviews yet. Be the first to share your experience.</div>
        ) : (
          <>
            {!isMobile ? (
              <div className="grid gap-6 md:grid-cols-3">
                {reviews.map((r) => {
                  const isExpanded = !!expanded[r._id];
                  const content = isExpanded ? r.comment : truncate(r.comment, 260);
                  return (
                    <article key={r._id} className="bg-paper rounded-xl border border-gray-100 p-6 shadow-sm">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-semibold text-lg">
                          {(r.name && r.name.trim()[0]) ? r.name.trim()[0].toUpperCase() : "A"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{r.name || "Anonymous"}</h3>
                              <div className="text-xs text-gray-400">{formatDate(r.createdAt)}</div>
                            </div>
                            <div className="text-right">
                              <DisplayStars rating={r.rating || 0} />
                              {r.email && <div className="mt-1 text-xs text-emerald-600">● Verified</div>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <blockquote className="font-serif text-gray-800 text-sm leading-relaxed mb-3 italic">
                        “{content}”
                      </blockquote>

                      {r.comment && r.comment.length > 260 && (
                        <button
                          type="button"
                          onClick={() => setExpanded((s) => ({ ...s, [r._id]: !s[r._id] }))}
                          className="text-sm text-amber-700 hover:underline"
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <Swiper
                modules={[Pagination]}
                spaceBetween={16}
                slidesPerView={1}
                pagination={{ clickable: true }}
                style={{ paddingBottom: 12 }}
              >
                {reviews.map((r) => {
                  const isExpanded = !!expanded[r._id];
                  const content = isExpanded ? r.comment : truncate(r.comment, 220);
                  return (
                    <SwiperSlide key={r._id}>
                      <article className="bg-paper rounded-xl border border-gray-100 p-5 shadow-sm mx-2">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-semibold text-lg">
                            {(r.name && r.name.trim()[0]) ? r.name.trim()[0].toUpperCase() : "A"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-sm">{r.name || "Anonymous"}</h3>
                                <div className="text-xs text-gray-400">{formatDate(r.createdAt)}</div>
                              </div>
                              <div className="text-right">
                                <DisplayStars rating={r.rating || 0} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <blockquote className="font-serif text-gray-800 text-sm leading-relaxed italic">
                          “{content}”
                        </blockquote>

                        {r.comment && r.comment.length > 220 && (
                          <button
                            type="button"
                            onClick={() => setExpanded((s) => ({ ...s, [r._id]: !s[r._id] }))}
                            className="mt-3 text-sm text-amber-700"
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </article>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            )}
          </>
        )}
      </div>

      {/* Submit form — lighter paper, balanced button placement */}
      <div className="paper-container bg-paper rounded-xl border p-6 shadow-sm">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Share your experience</h3>
            <p className="text-sm text-gray-600">Short, honest reviews help other readers.</p>

            <div className="mt-4 bg-paper-plain rounded-md border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-semibold text-lg">
                  {(name && name.trim()[0]) ? name.trim()[0].toUpperCase() : "Y"}
                </div>
                <div>
                  <div className="font-semibold text-sm">{name || "Your name"}</div>
                  <div className="text-xs text-gray-400">{new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-700 min-h-[60px]">
                {comment ? <div className="whitespace-pre-line">{comment}</div> : <span className="text-gray-400">Your preview will appear here.</span>}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarInput key={n} idx={n} filled={n <= rating} onClick={() => setRating(n)} />
                ))}
              </div>
              <div className="text-sm text-gray-500">Tap to set rating</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800">Comment</label>
              <textarea
                required
                rows={5}
                className="w-full border border-amber-100 bg-white/95 px-3 py-3 rounded focus:ring-2 focus:ring-amber-200 focus:border-amber-300 placeholder:text-gray-400"
                placeholder="Tell others what you liked (or didn't)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-amber-100 px-3 py-2 rounded focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-amber-100 px-3 py-2 rounded focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
              />
            </div>

            {/* Button centered and responsive */}
            <div className="pt-2">
              <div className="mx-auto md:max-w-xs">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit review"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Lighter paper texture CSS */}
      <style jsx>{`
        /* Ultra-light paper texture */
        .bg-paper {
          background-color: #fffef9; /* near-white cream */
          background-image:
            linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(255,255,255,0.03) 100%),
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='1'/><feColorMatrix type='saturate' values='0'/></filter><rect width='50' height='50' filter='url(%23n)' opacity='0.03' fill='white'/></svg>");
          background-repeat: repeat;
        }

        .bg-paper-plain {
          background-color: rgba(255,255,255,0.95);
          background-image:
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1'/><feColorMatrix type='saturate' values='0'/></filter><rect width='50' height='50' filter='url(%23n)' opacity='0.02' fill='white'/></svg>");
          background-repeat: repeat;
        }

        .paper-container {
          border-color: rgba(180,140,60,0.05);
        }

        @media (prefers-reduced-motion: reduce) {
          .swiper-slide,
          .swiper-wrapper,
          .swiper {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Testimonials;

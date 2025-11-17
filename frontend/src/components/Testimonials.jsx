// src/pages/home/Testimonials.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import getBaseUrl from '../utils/baseURL';
import Swal from 'sweetalert2';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const API_BASE = `${getBaseUrl()}/api/testimonials`;

// A nicer star button used in the form
const Star = ({ filled, onClick, idx }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-2xl leading-none focus:outline-none transition-transform transform ${
      filled ? 'text-yellow-400' : 'text-gray-300'
    } hover:scale-105`}
    aria-label={filled ? `star-${idx}-filled` : `star-${idx}-empty`}
    title={`${idx} star${idx > 1 ? 's' : ''}`}
  >
    ★
  </button>
);

// Small display stars for cards
const DisplayStars = ({ rating }) => (
  <div className="flex gap-1 items-center">
    {[1,2,3,4,5].map((n) => (
      <span key={n} className={`${n <= rating ? 'text-yellow-400' : 'text-gray-200'} text-lg`}>★</span>
    ))}
    <span className="text-xs text-gray-500 ml-2">({rating})</span>
  </div>
);

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  // fetch reviews (fetch up to 12 for carousel)
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}?limit=12`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch testimonials', err);
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
      Swal.fire('Error', 'Please add a comment and rating', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { name: name || undefined, email: email || undefined, comment, rating };
      await axios.post(API_BASE, payload);
      await Swal.fire('Thanks!', 'Your review was submitted.', 'success');
      // clear form
      setName('');
      setEmail('');
      setComment('');
      setRating(5);
      // refresh reviews
      fetchReviews();
    } catch (err) {
      console.error('Submit failed', err);
      Swal.fire('Error', err?.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // helper to show relative date (simple)
  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-purple-200 to-indigo-200 text-purple-800 font-semibold text-sm mb-3">
          Trusted by readers
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">What Our Customers Say</h2>
        <p className="text-gray-500">Real reviews from real people — honest feedback that helps us get better.</p>
      </div>

      {/* Carousel */}
      <div className="mb-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl shadow p-6 h-40" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">
            No reviews yet. Be the first to share your experience!
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={18}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4500, disableOnInteraction: true, pauseOnMouseEnter: true }}
            breakpoints={{
              640: { slidesPerView: 1 },
              900: { slidesPerView: 2 },
              1200: { slidesPerView: 3 },
            }}
          >
            {reviews.map((r) => (
              <SwiperSlide key={r._id}>
                <article className="bg-white rounded-xl shadow hover:shadow-md transform hover:-translate-y-1 transition p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {/* avatar circle */}
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                        { (r.name && r.name.trim()[0]) ? r.name.trim()[0].toUpperCase() : 'A' }
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{r.name || 'Anonymous'}</h3>
                        <div className="text-xs text-gray-400">{formatDate(r.createdAt)}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <DisplayStars rating={r.rating || 0} />
                    </div>
                  </div>

                  <div className="text-gray-700 text-sm leading-relaxed grow">
                    <span className="text-2xl align-top text-indigo-300 mr-2">“</span>
                    {r.comment}
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Submit form */}
      <div className="bg-gradient-to-tr from-white to-gray-50 rounded-xl shadow-lg p-6 md:p-8">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 items-start">
          {/* Left: live preview */}
          <div className="order-2 md:order-1">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Share your experience</h3>
              <p className="text-sm text-gray-500">Your review helps other readers find the right books.</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                  { (name && name.trim()[0]) ? name.trim()[0].toUpperCase() : 'Y' }
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{name || 'Your name'}</div>
                    <div className="text-xs text-gray-400">{new Date().toLocaleDateString()}</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="text-yellow-400 text-lg mr-1">★</span>
                    <span className="text-sm text-gray-600 align-middle"> {rating} / 5</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-gray-700 text-sm min-h-[60px]">
                {comment || <span className="text-gray-400">Your review preview will appear here...</span>}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <form onSubmit={handleSubmit} className="order-1 md:order-2 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1,2,3,4,5].map((n) => (
                  <Star key={n} idx={n} filled={n <= rating} onClick={() => setRating(n)} />
                ))}
              </div>
              <div className="text-sm text-gray-600">Tap to set rating</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border px-3 py-2 rounded resize-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                rows={4}
                placeholder="Tell others what you liked (or didn't)"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border px-3 py-2 rounded focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
              />
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

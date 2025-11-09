// src/pages/home/Testimonials.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import getBaseUrl from '../utils/baseURL';
import Swal from 'sweetalert2';

const API_BASE = `${getBaseUrl()}/api/testimonials`;

const Star = ({ filled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-2xl focus:outline-none"
    aria-label={filled ? 'filled-star' : 'empty-star'}
  >
    <span className={filled ? 'text-yellow-400' : 'text-gray-300'}>★</span>
  </button>
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

  // fetch reviews (3 latest)
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}?limit=3`);
      setReviews(res.data || []);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-semibold text-center">What Our Customers Say</h2>

      {/* Reviews */}
      <div className="grid md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-8">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="col-span-3 text-center py-8">No reviews yet. Be the first to review!</div>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="bg-white shadow-lg rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{r.name || 'Anonymous'}</h3>
                  <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center">
                  {[1,2,3,4,5].map((n) => (
                    <span key={n} className={n <= r.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 text-sm">{r.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Submit form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Rate us</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2 items-center">
            <div className="flex">
              {[1,2,3,4,5].map((n) => (
                <Star key={n} filled={n <= rating} onClick={() => setRating(n)} />
              ))}
            </div>
            <div className="text-sm text-gray-600">Please rate us</div>
          </div>

          <div>
            <label className="block text-sm mb-1">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border px-3 py-2 rounded resize-none"
              rows={3}
              placeholder="Share your experience..."
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Testimonials;

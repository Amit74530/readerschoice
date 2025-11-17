// src/pages/books/SingleBook.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetchBookByIdQuery } from '../../redux/features/books/booksApi';
import Loading from '../../components/Loading';
import getImgUrl from '../../utils/getImgUrl';
import { FaWhatsapp } from 'react-icons/fa';

const formatINR = (value) => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value ?? 0);
  } catch {
    return `₹${value ?? 0}`;
  }
};

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '';

const SingleBook = () => {
  const { id } = useParams();
  const { data: book, isLoading, isError, refetch } = useFetchBookByIdQuery(id);

  if (isLoading) return <Loading />;

  if (isError)
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-red-600 mb-3">Failed to load book.</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-indigo-600 text-white rounded">Retry</button>
      </div>
    );

  if (!book) return <div className="max-w-3xl mx-auto p-6 text-center">Book not found.</div>;

  const stockCount = book?.count ?? book?.stock ?? book?.quantity ?? 0;
  const isAvailable = Number(stockCount) > 0;
  const imgSrc = book?.coverImage ? getImgUrl(book.coverImage) : 'https://placehold.co/400x520/ddd/777?text=No+Image';

  const handleBuy = () => {
    const message = encodeURIComponent(`Hi! I'm interested in the book: "${book.title}" by ${book.author || 'Unknown'}.`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  // category could be string or array — normalize for tags
  const categories = (() => {
    if (!book?.category) return [];
    if (Array.isArray(book.category)) return book.category;
    try {
      const parsed = JSON.parse(book.category);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return book.category.split?.(',').map((s) => s.trim()) || [book.category];
  })();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/" className="inline-block mb-4 text-sm text-indigo-600 hover:underline">← Back to home</Link>

      <div className="bg-white rounded-lg shadow overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Image */}
        <div className="md:col-span-1 flex items-center justify-center">
          <img src={imgSrc} alt={book.title || 'Book cover'} className="w-full max-w-xs h-auto object-cover rounded" />
        </div>

        {/* Details */}
        <div className="md:col-span-2 flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{book.title || 'Untitled'}</h1>
          <p className="text-sm text-gray-500 mb-3">by {book.author || 'Unknown'}</p>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {categories.length > 0
              ? categories.map((c, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                    {c}
                  </span>
                ))
              : <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">Uncategorized</span>}
          </div>

          <div className="flex items-start gap-6 mb-4">
            <div>
              <div className="text-2xl font-semibold">{formatINR(book.newPrice)}</div>
              {book.oldPrice ? <div className="text-sm text-gray-400 line-through">{formatINR(book.oldPrice)}</div> : null}
            </div>

            <div className="ml-auto text-sm text-gray-600">
              <div className={`${isAvailable ? 'text-green-600' : 'text-red-500'} font-medium`}>
                {isAvailable ? `In Stock (${stockCount})` : 'Currently Borrowed'}
              </div>
            </div>
          </div>

          <div className="prose max-w-none text-gray-700 mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p>{book.description || 'No description available.'}</p>
          </div>

          <div className="mt-auto">
            <div
              onClick={handleBuy}
              role="button"
              className="inline-flex items-center gap-2 cursor-pointer border border-yellow-400 bg-yellow-100 text-yellow-900 px-4 py-2 rounded hover:bg-yellow-200 select-none"
              aria-disabled={!isAvailable}
            >
              <FaWhatsapp className="w-4 h-4" />
              <span className="font-semibold">Buy Now</span>
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBook;

// src/pages/books/BookCard.jsx
import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import getImgUrl from "../../utils/getImgUrl";
import { useAuth } from "../../context/AuthContext";

const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER ||
  import.meta.env.VITE_WhatsApp_NUMBER ||
  "6397184435";

const formatINR = (value) => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value ?? 0);
  } catch {
    return `₹${value ?? 0}`;
  }
};

const BookCard = ({ book }) => {
  const { currentUser } = useAuth();

  const handleInterestedClick = (e) => {
    e?.stopPropagation?.();
    const message = encodeURIComponent(
      `Hi! I'm interested in the book: "${book.title}" by ${book.author || "Unknown"}.`
    );
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, "_blank");
  };

  const stockCount = book.count ?? book.stock ?? book.quantity ?? 0;
  const isAvailable = Number(stockCount) > 0;
  const imgSrc = book.coverImage
    ? getImgUrl(book.coverImage)
    : "https://placehold.co/240x320/ddd/777?text=No+Image";

  return (
    <article className="w-full max-w-xs bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow transform hover:-translate-y-0.5 cursor-default">
      {/* Image box */}
      <div className="w-full aspect-[3/4] bg-gray-50 rounded-t-lg overflow-hidden flex items-center justify-center">
        <img
          src={imgSrc}
          alt={book.title || "Book cover"}
          className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
          onError={(e) =>
            (e.target.src =
              "https://placehold.co/240x320/ddd/777?text=No+Image")
          }
          draggable={false}
        />
      </div>

      {/* Book details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
          {book.title || "Untitled"}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          by {book.author || "Unknown"}
        </p>

        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {book.description
            ? book.description.length > 140
              ? `${book.description.slice(0, 140)}...`
              : book.description
            : "No description available."}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p
              className={`text-sm font-medium ${
                isAvailable ? "text-green-600" : "text-red-500"
              }`}
            >
              {isAvailable
                ? `In Stock (${stockCount})`
                : "Currently Borrowed"}
            </p>
            <p className="text-sm text-gray-500 capitalize">
              {book.category || "Uncategorized"}
            </p>
          </div>

          <div className="text-right">
            <div className="text-base font-semibold">
              {formatINR(book.newPrice)}
            </div>
            {book.oldPrice ? (
              <div className="text-xs text-gray-400 line-through">
                {formatINR(book.oldPrice)}
              </div>
            ) : null}
          </div>
        </div>

        {/* Only WhatsApp button now */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleInterestedClick}
            disabled={!isAvailable}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            title={
              isAvailable
                ? "Send WhatsApp message to owner"
                : "Not available"
            }
          >
            <FaWhatsapp className="w-4 h-4" />
            <span>I'm Interested</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default BookCard;

// src/pages/books/BookCard.jsx
import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import getImgUrl from "../../utils/getImgUrl";
import { useAuth } from "../../context/AuthContext";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || import.meta.env.VITE_WhatsApp_NUMBER || "";

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
  const { currentUser } = useAuth?.() ?? {};

  const stockCount = book?.count ?? book?.stock ?? book?.quantity ?? 0;
  const isAvailable = Number(stockCount) > 0;

  const imgSrc = book?.coverImage
    ? getImgUrl(book.coverImage)
    : "https://placehold.co/240x320/ddd/777?text=No+Image";

  // Buy handler (WhatsApp)
  const handleBuyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable) return;

    const message = encodeURIComponent(
      `Hi! I'm interested in the book: "${book?.title || 'Untitled'}" by ${book?.author || 'Unknown'}.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <article
      className="
        w-full
        max-w-[200px] sm:max-w-[220px] md:max-w-[240px]
        bg-white rounded-lg shadow-sm hover:shadow-md
        transition-transform hover:-translate-y-0.5
        cursor-default flex flex-col
      "
      aria-labelledby={`book-title-${book?._id}`}
    >
      {/* IMAGE (only this is clickable) */}
      <Link to={`/books/${book?._id}`} className="block rounded-t-lg overflow-hidden" aria-label={`Open details for ${book?.title || 'book'}`}>
        <div className="w-full h-[240px] sm:h-[260px] bg-gray-50 flex items-center justify-center">
          <img
            src={imgSrc}
            alt={book?.title || "Book cover"}
            className="w-full h-full object-cover object-center"
            onError={(e) =>
              (e.target.src =
                "https://placehold.co/240x320/ddd/777?text=No+Image")
            }
            draggable={false}
          />
        </div>
      </Link>

      {/* CONTENT */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 id={`book-title-${book?._id}`} className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 min-h-[48px]">
          {book?.title || "Untitled"}
        </h3>

        <p className="text-xs sm:text-sm text-gray-500 mb-1">
          by {book?.author || "Unknown"}
        </p>

        <p className="text-xs text-gray-600 mb-2 line-clamp-3 min-h-[56px]">
          {book?.description
            ? book.description.length > 80
              ? `${book.description.slice(0, 80)}...`
              : book.description
            : "No description available."}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <p
              className={`text-xs sm:text-sm font-medium ${
                isAvailable ? "text-green-600" : "text-red-500"
              }`}
            >
              {isAvailable ? `In Stock (${stockCount})` : "Currently Borrowed"}
            </p>
             <p
              className="
                text-xs text-gray-500 capitalize
                line-clamp-1
                max-h-[16px]
                overflow-hidden
              "
            >
              {Array.isArray(book?.category)
                ? book.category.join(", ")
                : book?.category || "Uncategorized"}
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm sm:text-base font-semibold">
              {formatINR(book?.newPrice)}
            </div>
            {book?.oldPrice ? (
              <div className="text-xs text-gray-400 line-through">
                {formatINR(book.oldPrice)}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* BUY NOW BAR */}
      <button
        type="button"
        onClick={handleBuyClick}
        disabled={!isAvailable}
        className={`
          w-full
          border border-yellow-400
          bg-yellow-100
          text-yellow-900
          font-semibold
          text-center
          py-2
          rounded-b-lg
          hover:bg-yellow-200
          transition
          flex items-center justify-center gap-2
          ${!isAvailable ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
        `}
        aria-disabled={!isAvailable}
      >
        <FaWhatsapp className="w-4 h-4" />
        <span className="text-sm">Buy Now</span>
      </button>
    </article>
  );
};

export default BookCard;

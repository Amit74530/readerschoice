// src/components/books/BookInfo.jsx
import React from 'react';

const BookInfo = ({ title, author, description, stock, extra }) => {
  // Try common field names on the extra object if stock is not provided
  const fallbackStock = (() => {
    if (!extra || typeof extra !== 'object') return undefined;
    // common names your API might use
    const names = ['stock', 'quantity', 'availableCount', 'available', 'count'];
    for (const n of names) {
      if (extra[n] !== undefined && extra[n] !== null) return extra[n];
    }
    // if backend uses a boolean like isBorrowed or isAvailable
    if (typeof extra.isBorrowed === 'boolean') return extra.isBorrowed ? 0 : 1;
    if (typeof extra.isAvailable === 'boolean') return extra.isAvailable ? 1 : 0;
    return undefined;
  })();

  // Prefer explicit stock prop, else fallbackStock
  const raw = stock !== undefined && stock !== null ? stock : fallbackStock;

  // Normalize to number when possible
  const parsedStock = (typeof raw === 'string' && raw.trim() !== '') ? Number(raw) :
                      (typeof raw === 'number' ? raw :
                      (raw === undefined ? NaN : Number(raw)));

  const isFiniteStock = Number.isFinite(parsedStock);
  const isAvailable = isFiniteStock ? parsedStock > 0 : false;

  return (
    <div>
      <h3 className="text-xl font-semibold">{title}</h3>
      {author && <p className="text-sm text-gray-600">by {author}</p>}
      {description && <p className="text-sm text-gray-700 mt-2">{description}</p>}

      <div className="mt-3 font-medium">
        {isFiniteStock ? (
          <p className={isAvailable ? 'text-green-600' : 'text-red-500'}>
            {isAvailable ? `In Stock (${parsedStock})` : 'Currently Borrowed'}
          </p>
        ) : (
          <p className="text-gray-600">Availability: Unknown</p>
        )}
      </div>
    </div>
  );
};

export default BookInfo;

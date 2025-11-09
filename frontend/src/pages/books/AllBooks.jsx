// src/pages/books/AllBooks.jsx
import React, { useMemo, useState } from "react";
import { useFetchAllBooksQuery } from "../../redux/features/books/booksApi";
import Loading from "../../components/Loading";
import BookCard from "./BookCard";
import { Link } from "react-router-dom";

const PAGE_SIZE = 12;

const AllBooks = () => {
  const { data: books = [], isLoading, isError, refetch } = useFetchAllBooksQuery();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const genreOptions = [
    "All","Fiction","Non-Fiction","Science","Technology","Romance","History",
    "Children","Biography","Mystery","Thriller","Horror","Fantasy","Adventure",
    "Poetry","Comics","Education","Philosophy","Business","Self-Help",
    "Health & Fitness","Spirituality","Politics","Travel","Cooking","Art & Design",
    "Drama","Science Fiction","Engineering","Programming","AI & Machine Learning",
    "Data Science","Mathematics"
  ];

  // filtered list based on search + category (case-insensitive, trimmed)
  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    const selCat = (category || "").trim().toLowerCase();

    return (books || []).filter((b) => {
      const title = (b.title || "").toLowerCase();
      const author = (b.author || "").toLowerCase();
      const bookCat = (b.category || "").trim().toLowerCase();

      const matchesQuery = !q || title.includes(q) || author.includes(q);
      const matchesCategory = !selCat || bookCat === selCat;

      return matchesQuery && matchesCategory;
    });
  }, [books, query, category]);

  const visibleBooks = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  if (isLoading) return <Loading />;

  if (isError)
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-red-600 mb-4">Failed to load books.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Explore Books</h1>
          <p className="text-gray-600 mt-1">Browse our full collection — new & second-hand.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* search input */}
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Search by title or author..."
            className="px-3 py-2 border rounded w-60 text-sm focus:outline-none"
          />

          {/* category filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="px-3 py-2 border rounded text-sm"
          >
            {genreOptions.map((c) => (
              <option key={c} value={c === "All" ? "" : c}>
                {c}
              </option>
            ))}
          </select>

          <Link
            to="/"
            className="text-sm text-indigo-600 hover:underline ml-auto sm:ml-0"
          >
            ← Back to home
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center">
          <p className="text-gray-700">No books found.</p>
          {books.length === 0 ? (
            <p className="text-sm text-gray-500 mt-2">There are currently no books in the catalog.</p>
          ) : (
            <p className="text-sm text-gray-500 mt-2">Try changing search or category.</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>

          {visibleCount < filtered.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleCount((c) => Math.min(filtered.length, c + PAGE_SIZE))}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllBooks;

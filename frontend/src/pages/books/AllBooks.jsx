// src/pages/books/AllBooks.jsx
import React, { useMemo, useState } from "react";
import { useFetchAllBooksQuery } from "../../redux/features/books/booksApi";
import Loading from "../../components/Loading";
import BookCard from "./BookCard";
import { Link } from "react-router-dom";

const PAGE_SIZE = 12;

const GENRE_OPTIONS = [
  { value: "", label: "All" },
  { value: "fiction", label: "Fiction" },
  { value: "non-fiction", label: "Non-Fiction" },
  { value: "science", label: "Science" },
  { value: "technology", label: "Technology" },
  { value: "romance", label: "Romance" },
  { value: "history", label: "History" },
  { value: "children", label: "Children" },
  { value: "biography", label: "Biography" },
  { value: "mystery", label: "Mystery" },
  { value: "thriller", label: "Thriller" },
  { value: "horror", label: "Horror" },
  { value: "fantasy", label: "Fantasy" },
  { value: "adventure", label: "Adventure" },
  { value: "poetry", label: "Poetry" },
  { value: "comics", label: "Comics" },
  { value: "education", label: "Education" },
  { value: "philosophy", label: "Philosophy" },
  { value: "business", label: "Business" },
  { value: "self-help", label: "Self-Help" },
  { value: "health-fitness", label: "Health & Fitness" },
  { value: "spirituality", label: "Spirituality" },
  { value: "politics", label: "Politics" },
  { value: "travel", label: "Travel" },
  { value: "cooking", label: "Cooking" },
  { value: "art", label: "Art & Design" },
  { value: "drama", label: "Drama" },
  { value: "science-fiction", label: "Science Fiction" },
  { value: "engineering", label: "Engineering" },
  { value: "programming", label: "Programming" },
  { value: "ai-ml", label: "AI & Machine Learning" },
  { value: "data-science", label: "Data Science" },
  { value: "mathematics", label: "Mathematics" },
];

const normalize = (s) =>
  (s || "")
    .toString()
    .trim()
    .toLowerCase();

const bookHasCategory = (book, selectedTags) => {
  // selectedTags: array of values (strings). If empty -> match all.
  if (!selectedTags || selectedTags.length === 0) return true;

  const cat = book?.category;
  if (!cat) return false;

  // normalize book categories to array of lowercase values
  let arr = [];
  if (Array.isArray(cat)) {
    arr = cat.map((c) => normalize(c));
  } else if (typeof cat === "string") {
    // it could be JSON string like '["fiction","romance"]' or comma-separated or a single value
    try {
      const parsed = JSON.parse(cat);
      if (Array.isArray(parsed)) arr = parsed.map((c) => normalize(c));
      else arr = [normalize(cat)];
    } catch {
      // not JSON - split by comma (if present) or treat as single
      if (cat.includes(",")) {
        arr = cat.split(",").map((c) => normalize(c));
      } else {
        arr = [normalize(cat)];
      }
    }
  } else {
    return false;
  }

  // book matches if it contains ALL selected tags (AND behaviour)
  return selectedTags.every((t) => arr.includes(normalize(t)));
};

const AllBooks = () => {
  const { data: books = [], isLoading, isError, refetch } = useFetchAllBooksQuery();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]); // array of genre values

  const toggleTag = (value) => {
    // if value is empty (All) -> clear tags
    if (!value) {
      setSelectedTags([]);
      setVisibleCount(PAGE_SIZE);
      return;
    }

    setSelectedTags((prev) => {
      const has = prev.includes(value);
      const next = has ? prev.filter((p) => p !== value) : [...prev, value];
      setVisibleCount(PAGE_SIZE);
      return next;
    });
  };

  // filtered list based on search + category tags (case-insensitive)
  const filtered = useMemo(() => {
    const q = normalize(query);

    return (books || []).filter((b) => {
      const title = normalize(b?.title);
      const author = normalize(b?.author);
      const matchesQuery = !q || title.includes(q) || author.includes(q);

      const matchesCategory = bookHasCategory(b, selectedTags);

      return matchesQuery && matchesCategory;
    });
  }, [books, query, selectedTags]);

  const visibleBooks = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

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

          <Link
            to="/"
            className="text-sm text-indigo-600 hover:underline ml-auto sm:ml-0"
          >
            ← Back to home
          </Link>
        </div>
      </div>

      {/* TAG PICKER */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map((g) => {
            const active = selectedTags.includes(g.value);
            return (
              <button
                key={g.value || "all"}
                type="button"
                onClick={() => toggleTag(g.value)}
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  g.value === "" && selectedTags.length === 0
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : active
                    ? "bg-yellow-400 text-white border-yellow-400"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                {g.label}
              </button>
            );
          })}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 place-items-center">
            {visibleBooks.map((book) => (
              <div key={book._id} className="flex justify-center">
                <BookCard book={book} />
              </div>
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

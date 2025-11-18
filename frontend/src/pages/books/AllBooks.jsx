// src/pages/books/AllBooks.jsx
import React, { useMemo, useEffect, useState } from "react";
import { useFetchAllBooksQuery } from "../../redux/features/books/booksApi";
import Loading from "../../components/Loading";
import BookCard from "./BookCard";
import { Link, useSearchParams } from "react-router-dom";

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
  if (!selectedTags || selectedTags.length === 0) return true;

  const cat = book?.category;
  if (!cat) return false;

  let arr = [];
  if (Array.isArray(cat)) {
    arr = cat.map((c) => normalize(c));
  } else if (typeof cat === "string") {
    try {
      const parsed = JSON.parse(cat);
      if (Array.isArray(parsed)) arr = parsed.map((c) => normalize(c));
      else arr = [normalize(cat)];
    } catch {
      if (cat.includes(",")) {
        arr = cat.split(",").map((c) => normalize(c));
      } else {
        arr = [normalize(cat)];
      }
    }
  } else {
    return false;
  }

  return selectedTags.every((t) => arr.includes(normalize(t)));
};

/* ---------- Small pagination helper UI logic ---------- */
const getPageRange = (current, total, maxButtons = 7) => {
  // returns array of page numbers or '...' strings
  const pages = [];
  if (total <= maxButtons) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  pages.push(1);
  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("...");
  pages.push(total);

  return pages;
};

const AllBooks = () => {
  const { data: books = [], isLoading, isError, refetch } = useFetchAllBooksQuery();
  const [queryParams, setQueryParams] = useSearchParams();
  const pageParam = parseInt(queryParams.get("page") || "1", 10);
  const [page, setPage] = useState(Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam);

  const [query, setQuery] = useState(queryParams.get("q") || "");
  const [selectedTags, setSelectedTags] = useState(
    queryParams.getAll("tag").length ? queryParams.getAll("tag") : []
  );

  // Keep URL and state in sync: when URL page changes externally, update local page
  useEffect(() => {
    const p = parseInt(queryParams.get("page") || "1", 10);
    setPage(Number.isNaN(p) || p < 1 ? 1 : p);
    // sync q and tags if present in URL (optional)
    const qFromUrl = queryParams.get("q") || "";
    setQuery(qFromUrl);
    const tagsFromUrl = queryParams.getAll("tag");
    setSelectedTags(tagsFromUrl.length ? tagsFromUrl : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams.toString()]); // run when search params change

  const toggleTag = (value) => {
    if (!value) {
      // clear tags and reset page & url
      setSelectedTags([]);
      setPage(1);
      queryParams.delete("tag");
      queryParams.set("page", "1");
      setQueryParams(queryParams);
      return;
    }

    setSelectedTags((prev) => {
      const has = prev.includes(value);
      const next = has ? prev.filter((p) => p !== value) : [...prev, value];
      // update URL params
      const newParams = new URLSearchParams(queryParams.toString());
      newParams.set("page", "1");
      newParams.delete("tag");
      next.forEach((t) => newParams.append("tag", t));
      setQueryParams(newParams);
      setPage(1);
      return next;
    });
  };

  // When user types in search, reset to page 1 and sync url (debounce omitted for brevity)
  const onSearchChange = (val) => {
    setQuery(val);
    setPage(1);
    const newParams = new URLSearchParams(queryParams.toString());
    if (val) newParams.set("q", val);
    else newParams.delete("q");
    newParams.set("page", "1");
    // keep existing tags if any
    // remove old tags and re-add from state
    newParams.delete("tag");
    selectedTags.forEach((t) => newParams.append("tag", t));
    setQueryParams(newParams);
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

  // total pages
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // clamp page
  useEffect(() => {
    let p = page;
    if (p > totalPages) p = totalPages;
    if (p < 1) p = 1;
    if (p !== page) setPage(p);

    // keep URL updated when internal page changes
    const newParams = new URLSearchParams(queryParams.toString());
    newParams.set("page", String(p));
    setQueryParams(newParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, totalPages]);

  // slice visible books for current page
  const visibleBooks = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

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
          <input
            type="text"
            value={query}
            onChange={(e) => onSearchChange(e.target.value)}
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
          <div className="grid **grid-cols-2** sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleBooks.map((book) => (
              <div key={book._id} className="flex justify-center w-full">
                <div className="w-full max-w-[240px]">
                  <BookCard book={book} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-center mt-8 space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`px-3 py-1 rounded border ${page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
            >
              Prev
            </button>

            {getPageRange(page, totalPages, 7).map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded border ${p === page ? "bg-indigo-600 text-white border-indigo-600" : "hover:bg-gray-100"}`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`px-3 py-1 rounded border ${page >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
            >
              Next
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 mt-3">
            Showing <strong>{visibleBooks.length}</strong> of <strong>{filtered.length}</strong> results — Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </div>
        </>
      )}
    </div>
  );
};

export default AllBooks;

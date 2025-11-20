// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMiniBars3CenterLeft, HiHome, HiOutlineBookOpen, HiInformationCircle } from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5";
import { HiOutlineUser } from "react-icons/hi";
import avatarImg from "../assets/avatar.png";
import { useAuth } from "../context/AuthContext";
import { useFetchAllBooksQuery } from "../redux/features/books/booksApi";

const BOOK_ROUTE_BASE = "/books";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);   // Hamburger menu
  const [isProfileOpen, setIsProfileOpen] = useState(false);    // Avatar dropdown

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const searchInputRef = useRef(null);
  const navRef = useRef(null);

  const { currentUser, logout } = useAuth();
  const { data: allBooks = [] } = useFetchAllBooksQuery();
  const navigate = useNavigate();

  // Close dropdowns if click outside
  useEffect(() => {
    function onDocClick(e) {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        setIsProfileOpen(false);
        setShowResults(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Filtered books (search)
  const filteredBooks = query.trim()
    ? allBooks.filter((book) =>
        (book.title || "").toLowerCase().includes(query.toLowerCase()) ||
        (book.author || "").toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const goToBook = (id) => {
    navigate(`${BOOK_ROUTE_BASE}/${id}`);
    setQuery("");
    setShowResults(false);
    setShowMobileSearch(false);
  };

  const handleLogOut = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <nav
        ref={navRef}
        className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between"
      >
        {/* LEFT: Hamburger + Brand */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 hover:bg-gray-100 rounded-md"
            onClick={() => setIsDropdownOpen((s) => !s)}
          >
            <HiMiniBars3CenterLeft className="h-6 w-6 text-gray-800" />
          </button>

          <Link to="/" className="text-lg font-bold text-gray-800 hidden sm:block">
            ReadersChoice
          </Link>
        </div>

        {/* CENTER: Search (Desktop) */}
        <div className="flex-1 flex justify-center">
          <div className="hidden sm:block w-full max-w-xl relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <IoSearchOutline className="h-5 w-5 text-gray-500" />
            </span>

            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search books or author..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="w-full bg-gray-100 rounded-md py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-300 focus:outline-none"
            />

            {showResults && query.trim() && (
              <div className="absolute left-0 right-0 mt-2 bg-white shadow-lg rounded-md max-h-64 overflow-auto border z-50">
                {filteredBooks.length ? (
                  filteredBooks.map((book) => (
                    <div
                      key={book._id}
                      onMouseDown={() => goToBook(book._id)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      <div className="font-medium">{book.title}</div>
                      <div className="text-xs text-gray-500">{book.author}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* Mobile search icon */}
          <div className="sm:hidden">
            {!showMobileSearch ? (
              <button
                className="p-2 hover:bg-gray-100 rounded-md"
                onClick={() => {
                  setShowMobileSearch(true);
                  setTimeout(() => searchInputRef.current?.focus(), 80);
                }}
              >
                <IoSearchOutline className="h-6 w-6 text-gray-700" />
              </button>
            ) : (
              <div className="fixed inset-0 bg-white z-50 p-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowMobileSearch(false);
                      setQuery("");
                    }}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    ✕
                  </button>

                  <div className="relative flex-1">
                    <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setShowResults(true)}
                      className="w-full bg-gray-100 rounded-md py-2 pl-10 pr-4"
                      placeholder="Search books or author..."
                    />
                  </div>
                </div>

                {showResults && query.trim() && (
                  <div className="mt-3 bg-white border rounded-md max-h-[60vh] overflow-auto">
                    {filteredBooks.length ? (
                      filteredBooks.map((book) => (
                        <div
                          key={book._id}
                          onMouseDown={() => goToBook(book._id)}
                          className="px-3 py-3 hover:bg-gray-100 border-b cursor-pointer"
                        >
                          <div className="font-medium">{book.title}</div>
                          <div className="text-xs text-gray-500">{book.author}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: User avatar */}
        <div className="relative">
          {currentUser ? (
            <>
              <button
                onClick={() => setIsProfileOpen((s) => !s)}
                className="focus:ring-2 focus:ring-indigo-300 rounded-full"
              >
                <img
                  src={avatarImg}
                  alt="avatar"
                  className="h-8 w-8 rounded-full ring-2 ring-indigo-500"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md w-40 z-50">
                  <button
                    onClick={handleLogOut}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link to="/login" className="p-1 hover:bg-gray-100 rounded-md">
              <HiOutlineUser className="h-6 w-6 text-gray-700" />
            </Link>
          )}
        </div>

        {/* HAMBURGER MENU (LEFT) */}
        {isDropdownOpen && (
          <div className="absolute left-3 top-14 w-60 bg-white shadow-xl rounded-md py-3 z-50 border">

            {/* HOME */}
            <Link
              to="/"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
            >
              <HiHome className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {/* BROWSE BOOKS */}
            <Link
              to="/books"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
            >
              <HiOutlineBookOpen className="w-4 h-4" />
              <span>Browse Books</span>
            </Link>

            {/* ABOUT (Triggers footer modal) */}
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                window.dispatchEvent(new Event("openAbout"));
              }}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <HiInformationCircle className="w-4 h-4" />
              <span>About</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

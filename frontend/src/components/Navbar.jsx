// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { HiMiniBars3CenterLeft } from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5";
import { HiOutlineUser } from "react-icons/hi";
import avatarImg from "../assets/avatar.png";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFetchAllBooksQuery } from "../redux/features/books/booksApi";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { currentUser, logout } = useAuth();

  const { data: allBooks = [] } = useFetchAllBooksQuery();

  const handleLogOut = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const filteredBooks = query.trim()
    ? allBooks.filter((book) =>
        (book.title?.toLowerCase().includes(query.toLowerCase()) ||
          book.author?.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-6">
      <nav className="flex justify-between items-center">
        {/* Left side */}
        <div className="flex items-center md:gap-16 gap-4">
          <Link to="/">
            <HiMiniBars3CenterLeft className="size-6" />
          </Link>

          {/* Search bar */}
          <div className="relative sm:w-72 w-40">
            <IoSearchOutline className="absolute left-3 top-2 text-gray-500" />
            <input
              type="text"
              placeholder="Search books or author..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 150)}
              className="bg-[#EAEAEA] w-full py-1 md:px-8 px-6 rounded-md focus:outline-none"
            />

            {showResults && query.trim() && (
              <div className="absolute z-50 bg-white shadow-md rounded-md mt-2 w-full max-h-60 overflow-y-auto border">
                {filteredBooks.length > 0 ? (
                  filteredBooks.slice(0, 6).map((book) => (
                    <Link
                      key={book._id}
                      to={`/books/${book._id}`}
                      onClick={() => {
                        setQuery("");
                        setShowResults(false);
                      }}
                      className="block px-3 py-2 hover:bg-gray-100 border-b last:border-none"
                    >
                      <div className="text-sm font-semibold text-gray-800">{book.title}</div>
                      <div className="text-xs text-gray-500">
                        by {book.author || "Unknown"}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="relative flex items-center md:space-x-3 space-x-2">
          {currentUser && (
            <div className="hidden sm:flex sm:flex-col sm:items-end sm:leading-tight mr-2">
              <span className="font-semibold text-sm text-gray-800">
                {currentUser.name ||
                  currentUser.displayName ||
                  currentUser.email?.split("@")[0] ||
                  "User"}
              </span>
              <span className="text-xs text-gray-500">Member</span>
            </div>
          )}

          {/* User / Login */}
          <div>
            {currentUser ? (
              <>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <img
                    src={avatarImg}
                    alt="avatar"
                    className={`size-7 rounded-full ${
                      currentUser ? "ring-2 ring-blue-500" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-40">
                    <ul className="py-2">
                      <li>
                        <button
                          onClick={handleLogOut}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login">
                <HiOutlineUser className="size-6" />
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

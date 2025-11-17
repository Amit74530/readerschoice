// src/pages/admin/DashboardLayout.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { HiViewGridAdd } from "react-icons/hi";
import { MdOutlineManageHistory } from "react-icons/md";
import { FiMenu, FiX } from 'react-icons/fi';

const NavButton = ({ to, children, label, active = false, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`inline-flex items-center justify-center py-3 px-3 rounded-lg transition
      ${active ? 'bg-gray-100 text-purple-700' : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'}`}
    aria-label={label}
  >
    {children}
  </Link>
);

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/");
  };

  useEffect(() => {
    // close on escape
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    // lock body scroll when drawer open on mobile
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [drawerOpen]);

  // click outside closes drawer
  useEffect(() => {
    const onClick = (e) => {
      if (!drawerOpen) return;
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [drawerOpen]);

  return (
    <section className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar (md+) */}
      <aside className="hidden md:flex md:flex-col md:w-24 lg:w-28 bg-gray-800 text-gray-300">
        <div className="flex-none h-20 w-full flex items-center justify-center">
          <a href="/" className="inline-flex items-center justify-center">
            <img src="/fav-icon.png" alt="Logo" className="h-10 w-10" />
          </a>
        </div>

        <nav className="flex flex-col gap-3 mt-6 px-2 flex-1">
          <NavButton to="/dashboard" label="Dashboard">
            <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </NavButton>

          <NavButton to="/dashboard/add-new-book" label="Add Book">
            <HiViewGridAdd className="h-6 w-6" />
          </NavButton>

          <NavButton to="/dashboard/manage-books" label="Manage Books">
            <MdOutlineManageHistory className="h-6 w-6" />
          </NavButton>
        </nav>

        <div className="flex-none h-20 w-full flex items-center justify-center border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="p-2 rounded hover:bg-gray-700 hover:text-white"
            aria-label="Logout"
          >
            <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

    {/* Mobile Header */}
<div className="flex flex-col flex-1">
  <header className="h-16 bg-white shadow flex items-center px-4 sm:px-6 md:px-8">
    <div className="flex items-center gap-3">
      {/* Mobile menu button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="md:hidden p-2 rounded hover:bg-gray-100"
        aria-label="Open menu"
      >
        <FiMenu className="h-6 w-6" />
      </button>

      {/* Logo + Title */}
      <a href="/" className="flex items-center gap-2">
        <img src="/fav-icon.png" alt="Logo" className="h-8 w-8" />
        <span className="text-lg font-semibold text-gray-800">Dashboard</span>
      </a>
    </div>

    {/* RIGHT SIDE — removed logout button */}
    <div className="ml-auto flex items-center gap-3">
      {/* EMPTY: previously had logout button — now removed */}
    </div>
  </header>


        {/* Mobile Drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div ref={drawerRef} className="relative w-64 max-w-full bg-gray-800 text-gray-200 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <img src="/fav-icon.png" alt="Logo" className="h-10 w-10" />
                  <div className="text-lg font-semibold">Dashboard</div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded hover:bg-gray-700">
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700"
                >
                  <svg aria-hidden="true" className="h-6 w-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/dashboard/add-new-book"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700"
                >
                  <HiViewGridAdd className="h-6 w-6 text-gray-200" />
                  <span>Add Book</span>
                </Link>

                <Link
                  to="/dashboard/manage-books"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700"
                >
                  <MdOutlineManageHistory className="h-6 w-6 text-gray-200" />
                  <span>Manage Books</span>
                </Link>
              </nav>

              <div className="mt-6 border-t border-gray-700 pt-4">
                <button
                  onClick={() => { setDrawerOpen(false); handleLogout(); }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 flex items-center gap-3"
                >
                  <svg aria-hidden="true" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>

            {/* spacer to allow clicking overlay to close */}
            <div className="flex-1" onClick={() => setDrawerOpen(false)} />
          </div>
        )}

        {/* Main content */}
        <main className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Dashboard</h1>
              <p className="text-sm text-gray-500">Book Store Inventory</p>
            </div>

            <div className="flex items-start md:items-center gap-3">
              <Link
                to="/dashboard/manage-books"
                className="inline-flex px-4 py-2 text-sm text-purple-600 border border-purple-600 rounded hover:bg-purple-50"
              >
                Manage Books
              </Link>

              <Link
                to="/dashboard/add-new-book"
                className="inline-flex px-4 py-2 text-sm text-white bg-purple-600 rounded hover:bg-purple-700"
              >
                Add New Book
              </Link>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </section>
  );
};

export default DashboardLayout;

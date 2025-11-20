// src/pages/dashboard/ManageBooks.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDeleteBookMutation, useFetchAllBooksQuery } from "../../../redux/features/books/booksApi";
import { Link, useNavigate } from "react-router-dom";

const STORAGE_KEY = "manageBooks_colWidths_v1";

const ManageBooks = () => {
  const navigate = useNavigate();
  const { data: books = [], refetch } = useFetchAllBooksQuery();
  const [deleteBook] = useDeleteBookMutation();

  // Search
  const [query, setQuery] = useState("");

  // table / resizing refs
  const tableRef = useRef(null);
  const colsRef = useRef([]); // will hold <col> elements
  const headerCellsRef = useRef([]); // th elements
  const isResizingRef = useRef(false);
  const activeColRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);
  const [colWidthsLoaded, setColWidthsLoaded] = useState(false);

  // Filtered books
  const filteredBooks = query.trim()
    ? books.filter((b) => {
        const q = query.toLowerCase();
        const title = (b.title || "").toLowerCase();
        const author = (b.author || "").toLowerCase();
        const category = (b.category || "").toLowerCase();
        return title.includes(q) || author.includes(q) || category.includes(q);
      })
    : books;

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Delete book
  const handleDeleteBook = async (id) => {
    try {
      await deleteBook(id).unwrap();
      alert("Book deleted successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to delete book:", error.message || error);
      alert("Failed to delete book. Please try again.");
    }
  };

  const formatINR = (value) => {
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value ?? 0);
    } catch (e) {
      return `₹${value ?? 0}`;
    }
  };

  // Helper: get saved widths from localStorage (if any)
  const loadSavedWidths = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const saveWidths = (widths) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
    } catch {
      // ignore
    }
  };

  // Auto-measure content width for a column index (px)
  const measureColumnContentWidth = (colIndex) => {
    if (!tableRef.current) return 100;
    const table = tableRef.current;
    // measure header cell
    const headerCell = headerCellsRef.current[colIndex];
    let max = 0;
    if (headerCell) {
      const rect = headerCell.getBoundingClientRect();
      max = Math.max(max, rect.width);
    }
    // measure a subset of body cells (to reduce cost)
    const rows = table.querySelectorAll("tbody tr");
    for (let i = 0; i < rows.length; i++) {
      const cell = rows[i].children[colIndex];
      if (cell) {
        const rect = cell.getBoundingClientRect();
        max = Math.max(max, rect.width);
      }
      if (i > 30) break; // sample up to 30 rows
    }
    // add small padding
    return Math.ceil(max + 24);
  };

  // Apply widths to <col> elements (array of px numbers or null)
  const applyWidthsToCols = (widths) => {
    if (!colsRef.current || colsRef.current.length === 0) return;
    widths.forEach((w, i) => {
      const colEl = colsRef.current[i];
      if (!colEl) return;
      if (typeof w === "number" && !Number.isNaN(w)) {
        colEl.style.width = `${w}px`;
      } else {
        colEl.style.width = "";
      }
    });
  };

  // Initialize column group: create <col> elements if not present and load saved widths or auto-measure
  useEffect(() => {
    if (!tableRef.current) return;
    const table = tableRef.current;

    // ensure colgroup exists and columns match header count
    let colgroup = table.querySelector("colgroup");
    const ths = Array.from(table.querySelectorAll("thead th"));
    if (!colgroup) {
      colgroup = document.createElement("colgroup");
      ths.forEach(() => {
        const c = document.createElement("col");
        colgroup.appendChild(c);
      });
      table.insertBefore(colgroup, table.firstChild);
    } else {
      // ensure colgroup has same number of cols as headers
      const currentCols = colgroup.querySelectorAll("col");
      if (currentCols.length !== ths.length) {
        colgroup.innerHTML = "";
        ths.forEach(() => {
          const c = document.createElement("col");
          colgroup.appendChild(c);
        });
      }
    }

    colsRef.current = Array.from(colgroup.querySelectorAll("col"));
    headerCellsRef.current = ths;

    // load saved widths if desktop
    if (isDesktop && !colWidthsLoaded) {
      const saved = loadSavedWidths();
      if (saved && Array.isArray(saved) && saved.length === colsRef.current.length) {
        applyWidthsToCols(saved);
      } else {
        // auto-measure and apply
        const autoWidths = colsRef.current.map((_, i) => measureColumnContentWidth(i));
        applyWidthsToCols(autoWidths);
        saveWidths(autoWidths);
      }
      setColWidthsLoaded(true);
    }

    // on small screens, clear inline widths so responsive CSS can work
    if (!isDesktop) {
      applyWidthsToCols(colsRef.current.map(() => null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableRef.current, books, isDesktop]);

  // Pointer handlers for resizing
  useEffect(() => {
    const onPointerMove = (e) => {
      if (!isResizingRef.current || !activeColRef.current) return;
      const dx = e.clientX - startXRef.current;
      const newWidth = Math.max(60, startWidthRef.current + dx); // min width 60px
      activeColRef.current.style.width = `${newWidth}px`;
    };

    const onPointerUp = () => {
      if (!isResizingRef.current) return;
      isResizingRef.current = false;
      // save current widths
      const widths = colsRef.current.map((c) => {
        const w = c.style.width;
        if (!w) return null;
        const px = parseInt(w.replace("px", ""), 10);
        return Number.isFinite(px) ? px : null;
      });
      saveWidths(widths);
      activeColRef.current = null;
      // remove document listeners
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };

    if (isResizingRef.current) {
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
    }

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  // start resize with a given column index
  const startResize = (colIndex, e) => {
    if (!isDesktop) return;
    const colEl = colsRef.current[colIndex];
    if (!colEl) return;
    isResizingRef.current = true;
    activeColRef.current = colEl;
    startXRef.current = e.clientX;
    startWidthRef.current = colEl.getBoundingClientRect().width;
    // add document listeners (pointermove/pointerup handled in effect via isResizingRef)
    e.preventDefault();
  };

  // double-click to auto-fit column to content
  const autoFitCol = (colIndex) => {
    const measured = measureColumnContentWidth(colIndex);
    const colEl = colsRef.current[colIndex];
    if (!colEl) return;
    colEl.style.width = `${Math.max(80, measured)}px`;
    const widths = colsRef.current.map((c) => {
      const w = c.style.width;
      if (!w) return null;
      const px = parseInt(w.replace("px", ""), 10);
      return Number.isFinite(px) ? px : null;
    });
    saveWidths(widths);
  };

  // Reset widths (useful in UI)
  const resetWidths = () => {
    const autoWidths = colsRef.current.map((_, i) => measureColumnContentWidth(i));
    applyWidthsToCols(autoWidths);
    saveWidths(autoWidths);
  };

  return (
    <section className="py-6 bg-blueGray-50 min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 mt-12">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
          <div className="rounded-t mb-0 px-4 py-3 border-0">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base text-blueGray-700">All Books</h3>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, author or category..."
                  className="px-3 py-1 rounded border border-gray-200 text-sm"
                />
                <button
                  onClick={() => {
                    setQuery("");
                    refetch();
                  }}
                  className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded"
                  type="button"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    // show all (same as reset for now)
                    setQuery("");
                    refetch();
                  }}
                  className="bg-indigo-500 text-white text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none ease-linear transition-all duration-150"
                  type="button"
                >
                  See all
                </button>

                {/* small controls for resizing */}
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={resetWidths}
                    className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                    type="button"
                    title="Reset column widths"
                  >
                    Reset cols
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="block w-full overflow-x-auto">
            <table ref={tableRef} className="items-center bg-transparent w-full border-collapse min-w-full">
              <colgroup>
                {/* initial col elements are created/managed dynamically in effect,
                    but having placeholders ensures the DOM structure exists early */}
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
              </colgroup>

              <thead>
                <tr>
                  {[
                    "#",
                    "Book Title",
                    "Author",
                    "Category",
                    "Count",
                    "Price",
                    "Actions",
                  ].map((heading, idx) => (
                    <th
                      key={heading}
                      ref={(el) => (headerCellsRef.current[idx] = el)}
                      className="px-4 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase font-semibold text-left relative"
                      style={{ userSelect: "none" }}
                    >
                      <div className="pr-6">{heading}</div>

                      {/* show resize handle only on desktop */}
                      {isDesktop && (
                        <div
                          role="separator"
                          aria-orientation="horizontal"
                          onPointerDown={(e) => startResize(idx, e)}
                          onDoubleClick={() => autoFitCol(idx)}
                          className="absolute right-0 top-0 h-full w-3 -mr-3 cursor-col-resize touch-none"
                          title="Drag to resize / double-click to auto-fit"
                        >
                          {/* visual handle: thin vertical line */}
                          <div className="h-full flex items-center justify-center">
                            <div className="w-px h-8 bg-gray-300" />
                          </div>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredBooks.map((book, index) => (
                  <tr key={book._id} className="odd:bg-white even:bg-gray-50">
                    <td className="border-t-0 px-4 align-middle text-xs p-3 text-left text-blueGray-700">{index + 1}</td>

                    <td className="border-t-0 px-4 align-middle text-xs p-3">
                      <div className="max-w-xs break-words">{book.title}</div>
                    </td>

                    <td className="border-t-0 px-4 align-middle text-xs p-3">
                      <div className="max-w-xs break-words">{book.author || "Unknown"}</div>
                    </td>

                    <td className="border-t-0 px-4 align-middle text-xs p-3">
                      <div className="max-w-xs break-words">
                        {Array.isArray(book.category)
                          ? book.category.join(", ")
                          : typeof book.category === "string"
                          ? book.category.split(",").map((c) => c.trim()).join(", ")
                          : "—"}
                      </div>
                    </td>

                    <td className="border-t-0 px-4 align-middle text-xs p-3">{book.count ?? 0}</td>

                    <td className="border-t-0 px-4 align-middle text-xs p-3">{formatINR(book.newPrice)}</td>

                    <td className="border-t-0 px-4 align-middle text-xs p-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/dashboard/edit-book/${book._id}`} className="text-indigo-600 hover:text-indigo-700 text-sm">
                          Edit
                        </Link>

                        <button onClick={() => handleDeleteBook(book._id)} className="bg-red-500 text-white text-sm px-3 py-1 rounded-full hover:bg-red-600">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManageBooks;

import React, { useState } from 'react'
import { useDeleteBookMutation, useFetchAllBooksQuery } from '../../../redux/features/books/booksApi';
import { Link, useNavigate } from 'react-router-dom';

const ManageBooks = () => {
    const navigate = useNavigate();

    const { data: books = [], refetch } = useFetchAllBooksQuery();

    const [deleteBook] = useDeleteBookMutation();

    // Search state
    const [query, setQuery] = useState("");

    // Handle deleting a book
    const handleDeleteBook = async (id) => {
        try {
            await deleteBook(id).unwrap();
            alert('Book deleted successfully!');
            refetch();
        } catch (error) {
            console.error('Failed to delete book:', error.message || error);
            alert('Failed to delete book. Please try again.');
        }
    };

    // Handle navigating to Edit Book page
    const handleEditClick = (id) => {
        navigate(`dashboard/edit-book/${id}`);
    };

    const formatINR = (value) => {
        try {
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value ?? 0);
        } catch (e) {
            return `₹${value ?? 0}`;
        }
    };

    // Filter books based on query (title, author, category)
    const filteredBooks = query.trim() ? books.filter((b) => {
        const q = query.toLowerCase();
        const title = (b.title || "").toLowerCase();
        const author = (b.author || "").toLowerCase();
        const category = (b.category || "").toLowerCase();
        return title.includes(q) || author.includes(q) || category.includes(q);
    }) : books;

    return (
        <section className="py-1 bg-blueGray-50">
            <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4 mx-auto mt-24">
                <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded ">
                    <div className="rounded-t mb-0 px-4 py-3 border-0">
                        <div className="flex flex-wrap items-center">
                            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                                <h3 className="font-semibold text-base text-blueGray-700">All Books</h3>
                            </div>

                            {/* Search box + See all */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by title, author or category..."
                                    className="px-3 py-1 rounded border border-gray-200 text-sm"
                                />
                                <button
                                    onClick={() => { setQuery(""); refetch(); }}
                                    className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded"
                                    type="button"
                                >
                                    Reset
                                </button>
                                <div className="relative w-auto px-4 max-w-full flex-grow flex-1 text-right">
                                    <button className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">See all</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="block w-full overflow-x-auto">
                        <table className="items-center bg-transparent w-full border-collapse ">
                            <thead>
                                <tr>
                                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">#</th>

                                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">Book Title</th>

                                    {/* Author column */}
                                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">Author</th>

                                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">Category</th>

                                    {/* Count column */}
                                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">Count</th>

                                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">Price</th>

                                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    filteredBooks && filteredBooks.map((book, index) => (
                                        <tr key={book._id}>
                                            <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blueGray-700 ">
                                                {index + 1}
                                            </th>

                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 ">
                                                {book.title}
                                            </td>

                                            {/* Author cell (fallback to 'Unknown' if missing) */}
                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 ">
                                                {book.author || 'Unknown'}
                                            </td>

                                            <td className="border-t-0 px-6 align-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                                {book.category}
                                            </td>

                                            {/* Count cell */}
                                            <td className="border-t-0 px-6 align-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                                {book.count ?? 0}
                                            </td>

                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                                {formatINR(book.newPrice)}
                                            </td>

                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 space-x-4">
                                                <Link to={`/dashboard/edit-book/${book._id}`} className="font-medium text-indigo-600 hover:text-indigo-700 mr-2 hover:underline underline-offset-2">
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteBook(book._id)}
                                                    className="font-medium bg-red-500 py-1 px-4 rounded-full text-white mr-2">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>

                        </table>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ManageBooks;

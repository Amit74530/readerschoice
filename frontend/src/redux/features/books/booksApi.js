// src/redux/features/books/booksApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getBaseUrl from '../../../utils/baseURL';

const baseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api/books`,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");

    // FIX: Only set header if valid token exists
    if (token && token !== "null" && token !== "undefined") {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      headers.delete("Authorization");
    }

    return headers;
  },
});

const booksApi = createApi({
  reducerPath: 'booksApi',
  baseQuery,
  tagTypes: ['Books'],
  endpoints: (builder) => ({
    // Fetch all books
    fetchAllBooks: builder.query({
      query: () => '/',
      providesTags: ['Books'],
    }),

    // Fetch single book by id
    fetchBookById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Books', id }],
    }),

    // Global book count: GET /api/books/count -> { count }
    getBookCount: builder.query({
      query: () => '/count',
      providesTags: ['Books'],
    }),

    // Count by title: GET /api/books/count?title=... -> { count }
    getCountByTitle: builder.query({
      query: (title) => `/count${title ? `?title=${encodeURIComponent(title)}` : ''}`,
      providesTags: ['Books'],
    }),

    // Create a new book
    // Expectation: caller passes a FormData instance (for file upload) or plain object (rare)
    addBook: builder.mutation({
      query: (payload) => {
        // If caller passed a FormData, send it directly (browser sets Content-Type)
        if (payload instanceof FormData) {
          return {
            url: '/create-book',
            method: 'POST',
            body: payload,
          };
        }

        // Otherwise assume plain object and send JSON
        return {
          url: '/create-book',
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        };
      },
      invalidatesTags: ['Books'],
    }),

    // Update a book
    // Usage patterns:
    // - updateBook({ id, formData })  // for multipart / file uploads
    // - updateBook({ id, body })      // for JSON-only updates (partial)
    updateBook: builder.mutation({
      query: ({ id, formData, body }) => {
        if (!id) throw new Error('updateBook requires an id');

        if (formData instanceof FormData) {
          return {
            url: `/edit/${id}`,
            method: 'PUT',
            body: formData, // no content-type header
          };
        }

        // fallback to sending JSON body if provided
        return {
          url: `/edit/${id}`,
          method: 'PUT',
          body: JSON.stringify(body ?? {}),
          headers: { 'Content-Type': 'application/json' },
        };
      },
      invalidatesTags: ['Books'],
    }),

    // Delete a book
    deleteBook: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Books'],
    }),
  }),
});

export const {
  useFetchAllBooksQuery,
  useFetchBookByIdQuery,
  useAddBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useGetBookCountQuery,
  useGetCountByTitleQuery,
} = booksApi;

export default booksApi;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getBaseUrl from '../../../utils/baseURL';

const baseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api/books`,
  credentials: 'include',
  prepareHeaders: (Headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      Headers.set('Authorization', `Bearer ${token}`);
    }
    return Headers;
  }
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
    // Use this to show "Existing copies" per title
    getCountByTitle: builder.query({
      query: (title) => `/count${title ? `?title=${encodeURIComponent(title)}` : ''}`,
      providesTags: ['Books'],
    }),

    // Create a new book
    addBook: builder.mutation({
      query: (newBook) => ({
        url: '/create-book',
        method: 'POST',
        body: newBook,
      }),
      invalidatesTags: ['Books'],
    }),

    // Update a book
    updateBook: builder.mutation({
      query: ({ id, ...rest }) => ({
        url: `/edit/${id}`,
        method: 'PUT',
        body: rest,
        headers: { 'Content-Type': 'application/json' },
      }),
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

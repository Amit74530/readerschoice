// src/pages/admin/addBook/AddBook.jsx
import React, { useState } from 'react';
import InputField from './InputField';
import SelectField from './SelectField';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

const AddBook = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
  };

  const onSubmit = async (data) => {
    // must be admin token
    const token = localStorage.getItem('token');
    if (!token) {
      return Swal.fire('Unauthorized', 'You must be logged in as admin to add books.', 'warning');
    }

    // basic validation: ensure a file selected
    if (!file) {
      return Swal.fire('No cover selected', 'Please choose a cover image for the book.', 'warning');
    }

    const fd = new FormData();
    fd.append('title', data.title);
    fd.append('author', data.author);
    fd.append('description', data.description || '');
    fd.append('category', data.category || '');
    fd.append('trending', data.trending ? 'true' : 'false');
    fd.append('oldPrice', data.oldPrice ?? 0);
    fd.append('newPrice', data.newPrice ?? 0);
    fd.append('count', data.count ?? 1);
    fd.append('cover', file); // field name expected by backend multer: 'cover'

    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/books/create-book`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // DO NOT set Content-Type — browser will set multipart boundary
        },
        body: fd,
      });

      const json = await res.json();

      if (!res.ok) {
        const msg = json?.message || 'Failed to create book';
        throw new Error(msg);
      }

      await Swal.fire({
        title: 'Book added',
        text: 'Your book is uploaded successfully!',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });

      // reset form
      reset();
      setFile(null);
    } catch (err) {
      console.error('Add book failed', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to add book. Please try again.',
        icon: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto md:p-6 p-3 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Book</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Title */}
        <InputField
          label="Title"
          name="title"
          placeholder="Enter book title"
          register={register}
          rules={{ required: true }}
        />
        {errors.title && <p className="text-sm text-red-500">Title is required.</p>}

        {/* Author */}
        <InputField
          label="Author"
          name="author"
          placeholder="Enter author name"
          register={register}
          rules={{ required: true }}
        />
        {errors.author && <p className="text-sm text-red-500">Author name is required.</p>}

        {/* Description */}
        <InputField
          label="Description"
          name="description"
          placeholder="Enter book description"
          type="textarea"
          register={register}
        />

        {/* Category */}
        <SelectField
          label="Category"
          name="category"
          options={[
            { value: "fiction", label: "Fiction" },
            { value: "non-fiction", label: "Non-Fiction" },
            { value: "science", label: "Science" },
            { value: "technology", label: "Technology" },
            { value: "romance", label: "Romance" },
            { value: "history", label: "History" },
            { value: "children", label: "Children’s Books" },
            { value: "biography", label: "Biography" },
            { value: "mystery", label: "Mystery" },
            { value: "thriller", label: "Thriller" },
            { value: "horror", label: "Horror" },
            { value: "fantasy", label: "Fantasy" },
            { value: "adventure", label: "Adventure" },
            { value: "poetry", label: "Poetry" },
            { value: "comics", label: "Manga / Comics" },
            { value: "education", label: "Education" },
            { value: "philosophy", label: "Philosophy" },
            { value: "business", label: "Business & Economics" },
            { value: "self-help", label: "Self Help" },
            { value: "health-fitness", label: "Health & Fitness" },
            { value: "spirituality", label: "Religious / Spiritual" },
            { value: "politics", label: "Politics" },
            { value: "travel", label: "Travel & Adventure" },
            { value: "cookbooks", label: "Cookbooks" },
            { value: "art", label: "Art & Photography" },
            { value: "drama", label: "Drama" },
            { value: "science-fiction", label: "Science Fiction" },
            { value: "engineering", label: "Engineering" },
            { value: "programming", label: "Programming" },
            { value: "ai-ml", label: "AI & Machine Learning" },
            { value: "data-science", label: "Data Science" },
            { value: "mathematics", label: "Mathematics" },
          ]}
          register={register}
        />

        {/* Trending */}
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register('trending')}
              className="rounded text-blue-600 focus:ring focus:ring-offset-2 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-semibold text-gray-700">Trending</span>
          </label>
        </div>

        {/* Prices */}
        <InputField
          label="Old Price (₹)"
          name="oldPrice"
          type="number"
          placeholder="Old Price in INR"
          register={register}
        />
        <InputField
          label="New Price (₹)"
          name="newPrice"
          type="number"
          placeholder="New Price in INR"
          register={register}
        />

        {/* Count */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Copies (count)</label>
          <input
            type="number"
            min="1"
            defaultValue="1"
            {...register('count', { required: true, min: 1 })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            placeholder="Number of copies"
          />
          {errors.count && <p className="text-sm text-red-500">Please enter a valid number (min 1).</p>}
        </div>

        {/* Cover Image */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="mb-2 w-full" />
          {file && <p className="text-sm text-gray-500">Selected: {file.name}</p>}
        </div>

        {/* Submit */}
        <button type="submit" className="w-full py-2 bg-green-500 text-white font-bold rounded-md" disabled={isLoading}>
          {isLoading ? 'Adding…' : 'Add Book'}
        </button>
      </form>
    </div>
  );
};

export default AddBook;

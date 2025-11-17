import React, { useState } from 'react';
import InputField from './InputField';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

const CATEGORY_OPTIONS = [
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
];

const AddBook = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
  };

  const toggleTag = (value) => {
    setSelectedTags(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
  };

  const onSubmit = async (data) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return Swal.fire('Unauthorized', 'You must be logged in as admin to add books.', 'warning');
    }

    setIsLoading(true);

    try {
      const fd = new FormData();
      if (data.title) fd.append('title', data.title);
      if (data.author) fd.append('author', data.author);
      fd.append('description', data.description || '');
      fd.append('category', JSON.stringify(selectedTags || [])); // multi-tag as JSON string
      fd.append('trending', data.trending ? 'true' : 'false');
      if (data.oldPrice !== undefined && data.oldPrice !== '') fd.append('oldPrice', data.oldPrice);
      if (data.newPrice !== undefined && data.newPrice !== '') fd.append('newPrice', data.newPrice);
      fd.append('count', data.count ?? 1);
      if (file) fd.append('cover', file); // optional

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/books/create-book`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // DO NOT set Content-Type for FormData
        body: fd,
      });

      // Safe parse: JSON if available, otherwise text (HTML/error pages)
      let payload;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        payload = await res.json();
      } else {
        payload = { message: await res.text() };
      }

      if (!res.ok) {
        throw new Error(payload?.message || JSON.stringify(payload) || 'Failed to create book');
      }

      await Swal.fire({ title: 'Book added', text: 'Your book is uploaded successfully!', icon: 'success' });
      reset();
      setFile(null);
      setSelectedTags([]);
    } catch (err) {
      console.error('Add book failed', err);
      Swal.fire({ title: 'Error!', text: err.message || 'Failed to add book. Please try again.', icon: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto md:p-6 p-3 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Book</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField label="Title" name="title" placeholder="Enter book title" register={register} rules={{ required: true }} />
        {errors.title && <p className="text-sm text-red-500">Title is required.</p>}

        <InputField label="Author" name="author" placeholder="Enter author name" register={register} rules={{ required: true }} />
        {errors.author && <p className="text-sm text-red-500">Author name is required.</p>}

        <InputField label="Description" name="description" placeholder="Enter book description" type="textarea" register={register} />

        {/* Tag picker inline */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Genres</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map(opt => {
              const active = selectedTags.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleTag(opt.value)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${active ? 'bg-yellow-400 text-white border-yellow-400' : 'bg-white text-gray-700 border-gray-200'}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">Select one or more genres (optional).</p>
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input type="checkbox" {...register('trending')} className="rounded text-blue-600" />
            <span className="ml-2 text-sm font-semibold text-gray-700">Trending</span>
          </label>
        </div>

        <InputField label="Old Price (₹)" name="oldPrice" type="number" placeholder="Old Price in INR" register={register} />
        <InputField label="New Price (₹)" name="newPrice" type="number" placeholder="New Price in INR" register={register} />

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Copies (count)</label>
          <input type="number" min="1" defaultValue="1" {...register('count', { required: true, min: 1 })} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring" />
          {errors.count && <p className="text-sm text-red-500">Please enter a valid number (min 1).</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image (optional)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="mb-2 w-full" />
          {file && <p className="text-sm text-gray-500">Selected: {file.name}</p>}
          <p className="text-xs text-gray-500 mt-1">You can skip this and upload later when editing the book.</p>
        </div>

        <button type="submit" className="w-full py-2 bg-blue-600 text-white font-bold rounded-md" disabled={isLoading}>
          {isLoading ? 'Adding…' : 'Add Book'}
        </button>
      </form>
    </div>
  );
};

export default AddBook;

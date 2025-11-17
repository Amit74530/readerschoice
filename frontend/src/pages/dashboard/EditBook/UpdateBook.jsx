import React, { useEffect, useState } from 'react';
import InputField from '../addBook/InputField';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useFetchBookByIdQuery } from '../../../redux/features/books/booksApi';
import Loading from '../../../components/Loading';
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

async function submitEditBook(bookId, token, fields, file) {
  const fd = new FormData();
  if (fields.title !== undefined) fd.append('title', fields.title);
  if (fields.author !== undefined) fd.append('author', fields.author);
  if (fields.description !== undefined) fd.append('description', fields.description);
  if (fields.category !== undefined) fd.append('category', JSON.stringify(fields.category));
  if (fields.newPrice !== undefined) fd.append('newPrice', fields.newPrice);
  if (fields.oldPrice !== undefined) fd.append('oldPrice', fields.oldPrice);
  if (fields.count !== undefined) fd.append('count', fields.count);
  if (fields.trending !== undefined) fd.append('trending', fields.trending ? 'true' : 'false');
  if (file) fd.append('cover', file);

  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/books/edit/${bookId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`, // DO NOT set Content-Type
    },
    body: fd,
  });

  // Safe parse
  const contentType = res.headers.get('content-type') || '';
  let payload;
  if (contentType.includes('application/json')) {
    payload = await res.json();
  } else {
    payload = { message: await res.text() };
  }

  return { ok: res.ok, status: res.status, payload };
}

const UpdateBook = () => {
  const { id } = useParams();
  const { data: bookData, isLoading, isError, refetch } = useFetchBookByIdQuery(id);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [file, setFile] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    if (bookData) {
      setValue('title', bookData.title);
      setValue('author', bookData.author);
      setValue('description', bookData.description);
      setValue('trending', !!bookData.trending);
      setValue('count', bookData.count ?? 0);
      setValue('oldPrice', bookData.oldPrice);
      setValue('newPrice', bookData.newPrice);

      const cats = Array.isArray(bookData.category) ? bookData.category : (bookData.category ? [bookData.category] : []);
      setSelectedTags(cats);
    }
  }, [bookData, setValue]);

  const toggleTag = (value) => {
    setSelectedTags(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
  };

  const onSubmit = async (data) => {
    const token = localStorage.getItem('token');
    const updatePayload = {
      ...data,
      oldPrice: data.oldPrice !== undefined ? Number(data.oldPrice) : undefined,
      newPrice: data.newPrice !== undefined ? Number(data.newPrice) : undefined,
      count: data.count !== undefined ? Number(data.count) : undefined,
      trending: data.trending || false,
      category: selectedTags,
    };

    try {
      const result = await submitEditBook(id, token, updatePayload, file);
      const { ok, payload } = result;
      if (!ok) {
        throw new Error(payload?.message || JSON.stringify(payload) || 'Update failed');
      }

      await Swal.fire({ title: "Book Updated!", text: "Your book details were updated successfully.", icon: "success" });
      refetch();
    } catch (error) {
      console.error("Update failed:", error);
      Swal.fire("Error!", error.message || "Failed to update book. Please try again.", "error");
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <div className='p-6 text-red-600'>Error fetching book data.</div>;

  return (
    <div className="max-w-lg mx-auto md:p-6 p-3 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Update Book: {bookData?.title}</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField label="Title" name="title" placeholder="Enter book title" register={register} errors={errors} />
        <InputField label="Author" name="author" placeholder="Enter author name" register={register} errors={errors} />
        <InputField label="Copies (count)" name="count" type="number" placeholder="Number of copies" register={register} errors={errors} />
        <InputField label="Description" name="description" placeholder="Enter book description" type="textarea" register={register} errors={errors} />

        {/* Tag picker inline */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Genres</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map(opt => {
              const active = selectedTags.includes(opt.value);
              return (
                <button
                  type="button"
                  key={opt.value}
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

        <InputField label="Old Price (₹)" name="oldPrice" type="number" placeholder="Old Price" register={register} errors={errors} />
        <InputField label="New Price (₹)" name="newPrice" type="number" placeholder="New Price" register={register} errors={errors} />

        <div className="mb-4">
          <label className="block font-semibold text-gray-700 mb-2">Update Cover Image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          {file && <p className="text-sm text-gray-500 mt-1">Selected: {file.name}</p>}
          <p className="text-xs text-gray-500 mt-1">Leave blank to keep current cover.</p>
        </div>

        <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors">
          Update Book
        </button>
      </form>
    </div>
  );
};

export default UpdateBook;

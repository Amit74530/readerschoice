import React, { useEffect, useState } from 'react';
import InputField from '../addBook/InputField';
import SelectField from '../addBook/SelectField';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useFetchBookByIdQuery } from '../../../redux/features/books/booksApi';
import Loading from '../../../components/Loading';
import Swal from 'sweetalert2';

// ✅ Helper function to handle multipart PUT with Cloudinary
async function submitEditBook(bookId, token, fields, file) {
  const fd = new FormData();
  if (fields.title) fd.append('title', fields.title);
  if (fields.author) fd.append('author', fields.author);
  if (fields.description) fd.append('description', fields.description);
  if (fields.category) fd.append('category', fields.category);
  if (fields.newPrice) fd.append('newPrice', fields.newPrice);
  if (fields.oldPrice) fd.append('oldPrice', fields.oldPrice);
  if (fields.count) fd.append('count', fields.count);
  if (fields.trending !== undefined) fd.append('trending', fields.trending);
  if (file) fd.append('cover', file); // file from input

  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/books/edit/${bookId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`, // DO NOT add Content-Type manually
    },
    body: fd,
  });

  return res.json();
}

const UpdateBook = () => {
  const { id } = useParams();
  const { data: bookData, isLoading, isError, refetch } = useFetchBookByIdQuery(id);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (bookData) {
      setValue('title', bookData.title);
      setValue('author', bookData.author);
      setValue('description', bookData.description);
      setValue('category', bookData?.category);
      setValue('trending', !!bookData.trending);
      setValue('count', bookData.count ?? 0);
      setValue('oldPrice', bookData.oldPrice);
      setValue('newPrice', bookData.newPrice);
    }
  }, [bookData, setValue]);

  const onSubmit = async (data) => {
    const token = localStorage.getItem('token');
    const updatePayload = {
      ...data,
      oldPrice: Number(data.oldPrice),
      newPrice: Number(data.newPrice),
      count: Number(data.count ?? 0),
      trending: data.trending || false,
    };

    try {
      const result = await submitEditBook(id, token, updatePayload, file);
      if (result.book) {
        await Swal.fire({
          title: "Book Updated!",
          text: "Your book details were updated successfully.",
          icon: "success",
        });
        refetch();
      } else {
        throw new Error(result.message || 'Unknown error');
      }
    } catch (error) {
      console.error("Update failed:", error);
      Swal.fire("Error!", "Failed to update book. Please try again.", "error");
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
          errors={errors}
        />

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

        <InputField label="Old Price (₹)" name="oldPrice" type="number" placeholder="Old Price" register={register} errors={errors} />
        <InputField label="New Price (₹)" name="newPrice" type="number" placeholder="New Price" register={register} errors={errors} />

        {/* ✅ New file input field */}
        <div className="mb-4">
          <label className="block font-semibold text-gray-700 mb-2">Update Cover Image</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          {file && <p className="text-sm text-gray-500 mt-1">Selected: {file.name}</p>}
        </div>

        <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors">
          Update Book
        </button>
      </form>
    </div>
  );
};

export default UpdateBook;

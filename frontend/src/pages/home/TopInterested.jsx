// src/components/TopInterested.jsx
import React, { useState } from 'react';
import BookCard from '../books/BookCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';

const categories = [
  "Choose a genre", "Business", "Technology", "Fiction", "Non-Fiction",
  "Self-Help", "Biography", "Science", "History", "Philosophy",
  "Education", "Children", "Horror", "Adventure", "Romance",
  "Fantasy", "Mystery", "Thriller", "Poetry", "Comics & Manga",
  "Travel", "Religion & Spirituality", "Cooking", "Health & Fitness", "Art & Photography"
];

const TopInterested = () => {
  const [selectedCategory, setSelectedCategory] = useState("Choose a genre");
  const { data: books = [] } = useFetchAllBooksQuery();

  const filteredBooks =
    selectedCategory === "Choose a genre"
      ? books
      : books.filter((book) => (book?.category || "").toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="py-8">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Top Interested</h2>

      <div className="mb-6 flex items-center">
        <select
          onChange={(e) => setSelectedCategory(e.target.value)}
          value={selectedCategory}
          name="category"
          id="category"
          className="border bg-[#EAEAEA] border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
        >
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <Swiper
        slidesPerView={1.05}
        spaceBetween={6}
        navigation={true}
        breakpoints={{
          480: { slidesPerView: 1.3, spaceBetween: 6 },
          640: { slidesPerView: 1.6, spaceBetween: 8 },
          768: { slidesPerView: 1.95, spaceBetween: 8 },
          900:  { slidesPerView: 2.2, spaceBetween: 10 },
          1024: { slidesPerView: 3, spaceBetween: 10},
          1280: { slidesPerView: 4, spaceBetween: 12 }, // 4 on wide screens
        }}
        modules={[Pagination, Navigation]}
        className="mySwiper"
      >
        {filteredBooks && filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <SwiperSlide key={book?._id || book?.id}>
              <BookCard book={book} />
            </SwiperSlide>
          ))
        ) : (
          <div className="p-6 text-gray-500">No books found for this category.</div>
        )}
      </Swiper>
    </div>
  );
};

export default TopInterested;

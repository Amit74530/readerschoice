// src/components/Recommended.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import BookCard from "../books/BookCard";

import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';

const Recommended = () => {
  const { data: books = [], isLoading } = useFetchAllBooksQuery();

  if (isLoading) {
    return <div className="py-16 text-center text-gray-500">Loading recommendations...</div>;
  }

  const trending = books.filter((b) => b?.trending);
  const recommendedBooks = trending.length > 0 ? trending : books.slice(0, 12);

  return (
    <div className="py-8">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Recommended for You</h2>

      {recommendedBooks.length === 0 ? (
        <p className="text-gray-500">No books to recommend right now.</p>
      ) : (
        <Swiper
          slidesPerView={1.05}        // show nearly one card, slight peek
          spaceBetween={6}            // minimal gap on smallest screens
          navigation={true}
          pagination={{ clickable: true }}
          breakpoints={{
            480:  { slidesPerView: 1.3, spaceBetween: 6 },
            640:  { slidesPerView: 1.6, spaceBetween: 8 },
            768:  { slidesPerView: 1.95, spaceBetween: 8 }, // tight for two-up
            900:  { slidesPerView: 2.2, spaceBetween: 10 },
            1024: { slidesPerView: 3,   spaceBetween: 10 },
            1280: { slidesPerView: 4,   spaceBetween: 12 },
          }}
          modules={[Pagination, Navigation]}
          className="mySwiper"
        >
          {recommendedBooks.map((book) => (
            <SwiperSlide
              key={book?._id || book?.id}
              className="flex justify-center !w-auto" // center slide content
            >
              <div className="w-full max-w-[260px]">
                <BookCard book={book} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default Recommended;

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

  // maximum slides we want to show at once (cap at 5)
  const maxSlides = Math.min(recommendedBooks.length, 5);

  // If only a single book exists, Swiper will naturally show just that one.
  // Optionally loop when we have enough items for nicer UX on desktop.
  const enableLoop = recommendedBooks.length > 4;

  return (
    <div className="py-8">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Recommended for You</h2>

      {recommendedBooks.length === 0 ? (
        <p className="text-gray-500">No books to recommend right now.</p>
      ) : (
        <Swiper
          // default for the smallest screens — a tiny peek of next slide
          slidesPerView={Math.min(maxSlides, 1.05)}
          spaceBetween={12}
          navigation={true}
          pagination={{ clickable: true }}
          loop={enableLoop}
          breakpoints={{
            // show up to 2 on small phones (if available)
            480:  { slidesPerView: Math.min(maxSlides, 2), spaceBetween: 12 },
            // tablets -> up to 3
            640:  { slidesPerView: Math.min(maxSlides, 3), spaceBetween: 12 },
            // small laptops -> up to 4
            900:  { slidesPerView: Math.min(maxSlides, 4), spaceBetween: 14 },
            // large screens -> up to 5
            1280: { slidesPerView: Math.min(maxSlides, 5), spaceBetween: 16 },
          }}
          modules={[Pagination, Navigation]}
          className="mySwiper"
        >
          {recommendedBooks.map((book) => (
            <SwiperSlide
              key={book?._id || book?.id}
              className="flex justify-center !w-auto"
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

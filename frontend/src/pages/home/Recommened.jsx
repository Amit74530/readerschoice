// src/components/Recommended.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import BookCard from '../../pages/books/BookCard';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';

const Recommended = () => {
  const { data: books = [], isLoading } = useFetchAllBooksQuery();

  if (isLoading) {
    return <div className="py-16 text-center text-gray-500">Loading recommendations...</div>;
  }

  const trending = books.filter((b) => b?.trending);
  const recommendedBooks = trending.length > 0 ? trending : books.slice(0, 8);

  return (
    <div className="py-12">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Recommended for You</h2>

      {recommendedBooks.length === 0 ? (
        <p className="text-gray-500">No books to recommend right now.</p>
      ) : (
        <Swiper
          slidesPerView={1}
          spaceBetween={12}
          navigation={true}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 12 },
            768: { slidesPerView: 2, spaceBetween: 14 },
            1024: { slidesPerView: 3, spaceBetween: 16 },
            1280: { slidesPerView: 4, spaceBetween: 16 }, // show 4 on normal/large windows
          }}
          modules={[Pagination, Navigation]}
          className="mySwiper"
        >
          {recommendedBooks.map((book) => (
            <SwiperSlide key={book?._id || book?.id}>
              <BookCard book={book} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default Recommended;

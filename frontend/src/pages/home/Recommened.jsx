import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import BookCard from '../books/BookCard';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';

const Recommended = () => {
  const { data: books = [], isLoading } = useFetchAllBooksQuery();

  if (isLoading) {
    return <div className="py-16 text-center text-gray-500">Loading recommendations...</div>;
  }

  // Pick trending books first, fallback to first few books
  const recommendedBooks =
    books.filter((book) => book.trending).length > 0
      ? books.filter((book) => book.trending)
      : books.slice(0, 6); // fallback to first 6

  return (
    <div className="py-16">
      <h2 className="text-3xl font-semibold mb-6">Recommended for You</h2>

      {recommendedBooks.length === 0 ? (
        <p className="text-gray-500">No books to recommend right now.</p>
      ) : (
        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          navigation={true}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 40 },
          }}
          modules={[Pagination, Navigation]}
          className="mySwiper"
        >
          {recommendedBooks.map((book) => (
            <SwiperSlide key={book._id}>
              <BookCard book={book} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default Recommended;

import React from "react";
import img1 from "../assets/store_interior/1.jpg";
import img2 from "../assets/store_interior/2.jpg";
import img3 from "../assets/store_interior/3.webp";

const StoreInterior = () => {
  const images = [
    {
      src: img1,
      title: "Cozy Reading Corner",
      desc: "A peaceful nook for book lovers to relax and explore stories.",
    },
    {
      src: img2,
      title: "Modern Book Display",
      desc: "Beautifully arranged shelves showcasing our latest arrivals.",
    },
    {
      src: img3,
      title: "Coffee & Pages",
      desc: "Enjoy your favorite brew while diving into a good read.",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 px-6 md:px-10 lg:px-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
        A Glimpse Inside Our Store
      </h2>

      {/* Grid layout for 2 on top and 1 below */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {images.slice(0, 2).map((item, index) => (
          <div
            key={index}
            className="relative group overflow-hidden rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300"
          >
            <img
              src={item.src}
              alt={item.title}
              className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-gray-200">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Centered single image below */}
      <div className="max-w-3xl mx-auto">
        <div className="relative group overflow-hidden rounded-2xl shadow-lg transform hover:-translate-y-2 transition-all duration-300">
          <img
            src={images[2].src}
            alt={images[2].title}
            className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h3 className="text-xl font-semibold mb-1">{images[2].title}</h3>
            <p className="text-sm text-gray-200">{images[2].desc}</p>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-600 mt-10 max-w-2xl mx-auto">
        Step inside our bookstore — where comfort meets curiosity. Every shelf,
        corner, and aroma of coffee invites you to stay a little longer.
      </p>
    </section>
  );
};

export default StoreInterior;

// src/components/StoreInterior.jsx
import React, { useEffect, useRef, useState } from "react";
import img1 from "../assets/store_interior/1.jpg";
import img2 from "../assets/store_interior/2.jpg";
import img3 from "../assets/store_interior/3.webp";

/**
 * StoreInterior — responsive gallery with:
 * - object-contain on mobile so full image is visible
 * - object-cover on larger screens for hero look
 * - reduced parallax on small screens
 */

const images = [
  {
    src: img1,
    title: "Cozy Reading Corner",
    desc: "A calm space for readers to immerse themselves in stories.",
  },
  {
    src: img2,
    title: "Modern Book Display",
    desc: "Neatly organized shelves showcasing new arrivals.",
  },
  {
    src: img3,
    title: "Bestsellers Shelf",
    desc: "Our most popular books — always in high demand.",
  },
];

const StoreInterior = () => {
  const cardRefs = useRef([]);
  const imgRefs = useRef([]);
  const [visible, setVisible] = useState([false, false, false]);

  // IntersectionObserver to animate cards in
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.dataset.index);
          if (entry.isIntersecting) {
            setVisible((prev) => {
              if (prev[idx]) return prev;
              const next = [...prev];
              next[idx] = true;
              return next;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.18 }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Parallax: minor translateY on images; reduced on small screens
  useEffect(() => {
    let rafId = null;

    const handle = () => {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const isSmall = window.innerWidth < 640; // treat <640px as phone
      const maxTranslate = isSmall ? 6 : 10; // reduce on phone
      cardRefs.current.forEach((card, idx) => {
        const imgEl = imgRefs.current[idx];
        if (!card || !imgEl) return;
        const rect = card.getBoundingClientRect();
        if (rect.top < viewportHeight && rect.bottom > 0) {
          const centerOffset = (rect.top + rect.bottom) / 2 - viewportHeight / 2;
          const maxOffset = viewportHeight / 2 + rect.height / 2;
          let progress = centerOffset / maxOffset;
          if (progress > 1) progress = 1;
          if (progress < -1) progress = -1;
          const translateY = -progress * maxTranslate; // px
          // Only apply translate, keep scale only on larger screens
          const scale = isSmall ? 1 : 1.03;
          imgEl.style.transform = `translateY(${translateY}px) scale(${scale})`;
        }
      });
      rafId = null;
    };

    const onScroll = () => {
      if (rafId == null) rafId = requestAnimationFrame(handle);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // initial
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const setCardRef = (el, idx) => (cardRefs.current[idx] = el);
  const setImgRef = (el, idx) => (imgRefs.current[idx] = el);

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 px-6 md:px-10 lg:px-20">
      {/* Title */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 relative inline-block">
          A Glimpse Inside Our Store
          <span
            className="absolute left-1/2 transform -translate-x-1/2 -bottom-4 w-40 h-1 rounded-full"
            style={{
              background: "linear-gradient(90deg,#d4af37,#f3e1b6)",
              boxShadow: "0 6px 18px rgba(212,175,55,0.12)",
            }}
          />
        </h2>

        <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
          Step inside our bookstore — a warm and thoughtfully curated space designed for true book lovers.
        </p>
      </div>

      {/* Grid: top two */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 max-w-7xl mx-auto">
        {images.slice(0, 2).map((item, idx) => {
          const isVisible = visible[idx];
          return (
            <article
              key={idx}
              ref={(el) => setCardRef(el, idx)}
              data-index={idx}
              className={`
                relative overflow-hidden rounded-3xl border border-[#d4af37]/25 bg-white shadow-lg
                transition-all duration-700
                ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
              `}
              style={{
                transformOrigin: "center",
                willChange: "transform, opacity",
              }}
            >
              {/* Responsive heights:
                  - mobile: h-56 (short) and object-contain so full image is visible
                  - sm/md: taller h-80 / h-96 and object-cover for hero look */}
              <div className="relative w-full h-56 sm:h-80 md:h-96 overflow-hidden rounded-3xl">
                <img
                  ref={(el) => setImgRef(el, idx)}
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-contain sm:object-cover transition-transform duration-700 will-change-transform"
                  style={{ transform: "translateY(0) scale(1)" }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-lg md:text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm md:text-base text-white/90">{item.desc}</p>
                </div>

                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl transition-shadow duration-500"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.06)" }}
                />
              </div>
            </article>
          );
        })}
      </div>

      {/* Center large image */}
      <div className="max-w-4xl mx-auto">
        {(() => {
          const idx = 2;
          const item = images[idx];
          const isVisible = visible[idx];
          return (
            <article
              ref={(el) => setCardRef(el, idx)}
              data-index={idx}
              className={`
                relative overflow-hidden rounded-3xl border border-[#d4af37]/25 bg-white shadow-lg
                transition-all duration-700
                ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
              `}
              style={{ willChange: "transform, opacity" }}
            >
              {/* mobile: shorter h-64 and object-contain; larger: h-96 */}
              <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden rounded-3xl">
                <img
                  ref={(el) => setImgRef(el, idx)}
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-contain sm:object-cover transition-transform duration-700 will-change-transform"
                  style={{ transform: "translateY(0) scale(1)" }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-xl md:text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm md:text-base text-white/90">{item.desc}</p>
                </div>

                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl transition-shadow duration-500"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.06)" }}
                />
              </div>
            </article>
          );
        })()}
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto text-center mt-12">
        <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
          Our shelves are curated with care — from timeless classics to today's bestsellers.
        </p>
      </div>
    </section>
  );
};

export default StoreInterior;

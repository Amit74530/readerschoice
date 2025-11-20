// src/components/Footer.jsx
import React, { useState, useEffect, useRef } from "react";
import footerLogo from "../assets/footer-logo.png";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const AboutModal = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-5 text-gray-800 transform transition-opacity duration-200 max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id="about-title" className="text-2xl font-semibold">
            About Reader’s Choice
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close about dialog"
          >
            ✕
          </button>
        </div>

        {/* Full original about text (restored) */}
        <div className="mt-4 text-sm leading-relaxed text-gray-700 space-y-4">
          <p className="m-0">
            <strong>Reader’s Choice</strong> stands among Dehradun’s most cherished local bookstores — a
            space where stories, people, and passion for reading come together. Established in the late
            1980s, it began as a humble bookstall and gradually evolved into a trusted literary destination
            loved by generations of readers.
          </p>

          <p className="m-0">
            What truly sets us apart is our diverse and affordable collection. From new and pre-owned books
            to fiction, non-fiction, encyclopedias, religious works, and even popular manga titles like
            <em> Naruto</em> and <em>Spy x Family</em>, there’s something for every reader. With most books
            priced between <strong>₹150–₹200</strong>, we make the joy of reading accessible to all.
          </p>

          <p className="m-0">
            We take pride in curating books with care — focusing on value, quality, and the unique interests
            of our community. Whether you’re a student, a casual reader, a collector, or someone rediscovering
            the habit, our shelves are designed to feel familiar and inviting.
          </p>

          <p className="m-0">
            Visitors often describe Reader’s Choice as more than a bookstore — a warm and welcoming place where
            conversations flow as naturally as the stories within our books. Over the decades, we’ve enjoyed
            meeting countless readers, recommending titles, and sharing the small joys that books bring into
            everyday life.
          </p>

          <p className="m-0">
            From timeless classics and modern bestsellers to children’s literature, competitive exam books,
            rare finds, and trending graphic novels, our collection grows and evolves with every passing year.
          </p>

          <p className="m-0">
            Whether you’re seeking a bestseller, a nostalgic reread, a rare gem, or simply a quiet moment among
            books, Reader’s Choice is a place where every story finds its reader — and every reader feels at home.
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const contactRef = useRef(null);

  useEffect(() => {
    function onOpenAbout() {
      setIsAboutOpen(true);
    }
    function onOpenContact() {
      if (contactRef.current) {
        contactRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    window.addEventListener("openAbout", onOpenAbout);
    window.addEventListener("openContact", onOpenContact);
    return () => {
      window.removeEventListener("openAbout", onOpenAbout);
      window.removeEventListener("openContact", onOpenContact);
    };
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-6 px-6">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: logo + small blurb (single-line teaser with ellipsis) */}
        <div className="flex items-center gap-4 min-w-0">
          <img src={footerLogo} alt="Reader's Choice" className="w-20 h-auto shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold truncate">Reader's Choice</h3>
              <span className="text-xs text-gray-400 hidden md:inline">· Dehradun</span>
            </div>

            {/* Single-line teaser — truncated with ellipsis */}
            <p className="text-xs text-gray-300 mt-1 max-w-sm truncate">
              Reader’s Choice is a warm, community-loved bookstore offering a curated mix of new and
              secondhand titles — cozy, local, and welcoming.
            </p>

            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => setIsAboutOpen(true)}
                className="text-xs text-gray-200 underline hover:text-white"
                aria-haspopup="dialog"
              >
                About
              </button>
              <span className="hidden md:inline text-xs text-gray-500">|</span>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Reader's+Choice+Dehradun"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-300 hover:text-white flex items-center gap-1"
              >
                <FiMapPin className="w-3 h-3" /> Map
              </a>
            </div>
          </div>
        </div>

        {/* Right: compact contact + socials */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8">
          <div ref={contactRef} className="text-sm text-gray-300">
            <div className="flex items-center gap-3">
              <FiMail className="w-4 h-4 text-gray-400" />
              <a href="mailto:readerschoice@gmail.com" className="hover:text-white text-sm">readerschoice@gmail.com</a>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <FiPhone className="w-4 h-4 text-gray-400" />
              <a href="tel:+919876543210" className="hover:text-white text-sm">+91 98765 43210</a>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <FiMapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Mall Road, Dehradun</span>
            </div>
          </div>
        </div>
      </div>

      {/* slim bottom row */}
      <div className="max-w-screen-2xl mx-auto text-center mt-5 pt-4 border-t border-gray-800">
        <div className="text-xs text-gray-400">
          © 2025 Reader's Choice — Crafted with ❤️ in Dehradun · Dhara Media
        </div>
      </div>

      {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}
    </footer>
  );
};

export default Footer;

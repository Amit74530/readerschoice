import React, { useState } from "react";
import footerLogo from "../assets/footer-logo.png";

const AboutModal = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 text-gray-800"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
      >
        <div className="flex justify-between items-start">
          <h3 id="about-title" className="text-2xl font-semibold">
            About Reader’s Choice
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-4"
            aria-label="Close about dialog"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 text-sm leading-relaxed">
          <p>
            <strong>Reader’s Choice</strong> stands among Dehradun’s most cherished local bookstores — a
            space where stories, people, and passion for reading come together. Established in the late
            1980s, it began as a humble bookstall and gradually evolved into a trusted literary destination
            loved by generations of readers.
          </p>

          <p className="mt-3">
            What truly sets us apart is our diverse and affordable collection. From new and pre-owned books
            to fiction, non-fiction, encyclopedias, religious works, and even popular manga titles like
            <em> Naruto</em> and <em>Spy x Family</em>, there’s something for every reader. With most books
            priced between <strong>₹150–₹200</strong>, we make the joy of reading accessible to all.
          </p>

          <p className="mt-3">
            At Reader’s Choice, we believe in more than just selling books — we believe in building
            connections. Our visitors often speak fondly of the store’s friendly and welcoming atmosphere,
            where conversations flow as easily as stories on a page.
          </p>

          <p className="mt-3">
            Whether you’re seeking a bestseller, a rare find, or a nostalgic reread, Reader’s Choice is a
            place where every story finds its reader — and every reader feels at home.
          </p>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
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

  return (
    <footer className="bg-gray-900 text-white py-10 px-4">
      {/* Top Section */}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Left - Logo & About (About is now a clickable trigger) */}
        <div className="w-full md:w-1/2">
          <img src={footerLogo} alt="Reader's Choice" className="mb-5 w-36" />

          <h2 className="text-lg font-semibold mb-3">About</h2>

          <p className="text-gray-300 text-sm leading-relaxed max-w-md">
            Reader’s Choice is Dehradun’s most loved local bookstore — where stories,
            readers, and memories meet. We bring together new and secondhand titles
            across genres, making reading affordable, accessible, and heartfelt.
          </p>

          <button
            onClick={() => setIsAboutOpen(true)}
            className="mt-4 inline-block text-sm text-white underline hover:text-gray-300"
            aria-haspopup="dialog"
          >
            Read more about us
          </button>
        </div>

        {/* Right - Contact Info */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-3">Contact</h2>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>
              <span className="font-medium text-white">Email:</span>{" "}
              <a href="mailto:readerschoice@gmail.com" className="hover:text-primary">
                readerschoice@gmail.com
              </a>
            </li>
            <li>
              <span className="font-medium text-white">Phone:</span>{" "}
              <a href="tel:+919876543210" className="hover:text-primary">
                +91 98765 43210
              </a>
            </li>
            <li>
              <span className="font-medium text-white">Address:</span>{" "}
              Mall Road, Dehradun, Uttarakhand, India
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="container mx-auto text-center mt-10 border-t border-gray-700 pt-6 text-gray-400 text-sm">
        © 2025 Reader's Choice | Crafted with love in Dehradun | Dhara Media.
      </div>

      {/* About Modal */}
      {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}
    </footer>
  );
};

export default Footer;

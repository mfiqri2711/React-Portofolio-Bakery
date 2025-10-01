import React from 'react';
import { FaHeart, FaEnvelope, FaLinkedin, FaInstagram } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="text-center py-3 bg-dark text-light">
      <p>
        Dibuat dengan <FaHeart className="text-danger" /> React + Bootstrap
      </p>

      <div className="mt-2">
        {/* Email */}
        <a href="mailto:m.fiqri2711@gmail.com" className="text-light mx-2" target="_blank" rel="noopener noreferrer">
          <FaEnvelope size={20} />
          m.fiqri2711@gmail.com
        </a>

        {/* LinkedIn */}
        <a href="https://www.linkedin.com/in/muhammad-fiqri-16b854194/" className="text-light mx-2" target="_blank" rel="noopener noreferrer">
          <FaLinkedin size={20} /> Muhammad Fiqri
        </a>

        {/* Instagram */}
        <a href="https://www.instagram.com/user634792/" className="text-light mx-2" target="_blank" rel="noopener noreferrer">
          <FaInstagram size={20} /> Muhammad Fiqri
        </a>
      </div>
    </footer>
  );
}

export default Footer;

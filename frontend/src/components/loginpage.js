import React, { useState, useEffect } from "react";
import { FaMicrophone } from "react-icons/fa";          // Speech to Text
import { FaLanguage } from "react-icons/fa";            // Text to Text
import { FaVolumeUp } from "react-icons/fa";            // Text to Speech
import { FaComments } from "react-icons/fa";            // Speech to Speech
import { FaHands } from "react-icons/fa";               // Sign Language Understanding
import { FaClosedCaptioning } from "react-icons/fa";    // Caption Generation
import { FaGlobe } from "react-icons/fa";

import { Link } from "react-router-dom"; 

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// CORRECTED: Import Swiper modules from 'swiper/modules'
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import images from assets
import bg1 from "../assets/images/pic1.jpg";
import bg2 from "../assets/images/pic2.png";
import bg3 from "../assets/images/pic3.png";

import "./loginpage.css";

const LoginPage = () => {
  const [hideLogo, setHideLogo] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setHideLogo(true); // scrolling down -> hide logo
      } else {
        setHideLogo(false); // scrolling up -> show logo
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        {/* Logo (hide/show on scroll) */}
        <div className={`logo ${hideLogo ? "hidden" : ""}`}>
          <FaGlobe className="logo-icon" />
          LinguaAI
        </div>

        {/* Center pill nav */}
        <div className="nav-center">
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            
            <li><a href="#deals">Deals / Offers</a></li>
            <li><a href="#blog">Blog / Stories</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>

        {/* Right side actions */}
        <div className="nav-actions">
          <button className="watch-btn">Watch Demo ▶</button>
        </div>
      </nav>

      {/* Hero Section (Carousel) */}
      <section className="carousel-section">
        <Swiper
          className="custom-swiper"
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
        >
          {/* Slide 1 */}
          <SwiperSlide>
            <div className="carousel-card" style={{ backgroundImage: `url(${bg1})` }}>
              <div className="text-block left">
                <h1>Connect Across Languages</h1>
                <p>Break barriers and communicate globally in real-time using AI-powered translation.</p>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 2 */}
          <SwiperSlide>
            <div className="carousel-card" style={{ backgroundImage: `url(${bg2})` }}>
              <div className="text-block left">
                <h1>AI-Powered Assistance</h1>
                <p>Experience instant translations and comprehension with cutting-edge AI.</p>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 3 */}
          <SwiperSlide>
            <div className="carousel-card" style={{ backgroundImage: `url(${bg3})` }}>
              <div className="text-block left">
                <h1>Sign Language to Text</h1>
                <p>Convert sign language into text instantly to enable inclusive communication for the hearing impaired.</p>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2>Why Choose LinguaAI?</h2>
        <p>
            Break language barriers with our AI-powered tools designed for inclusive and accessible communication.
        </p>

        <div className="features-grid">
            {/* Speech to Text */}
            <div className="feature-card">
            <FaMicrophone className="feature-icon" />
            <h3>Speech to Text</h3>
            <p>Convert spoken words into accurate, real-time text across multiple languages.</p>
            <Link to="/speech-to-text" className="feature-link">Try Now →</Link>
            </div>

            {/* Text to Text */}
            <div className="feature-card">
            <FaLanguage className="feature-icon" />
            <h3>Text to Text</h3>
            <p>Translate written content instantly to bridge communication gaps worldwide.</p>
            <Link to="/text-to-text" className="feature-link">Try Now →</Link>
            </div>

            {/* Text to Speech */}
            <div className="feature-card">
            <FaVolumeUp className="feature-icon" />
            <h3>Text to Speech</h3>
            <p>Bring text to life with natural-sounding AI voices in different languages.</p>
            <Link to="/text-to-speech" className="feature-link">Try Now →</Link>
            </div>

            {/* Speech to Speech */}
            <div className="feature-card">
            <FaComments className="feature-icon" />
            <h3>Speech to Speech</h3>
            <p>Real-time spoken translation for seamless conversations across cultures.</p>
            <Link to="/speech-to-speech" className="feature-link">Try Now →</Link>
            </div>

            {/* Sign Language Understanding */}
            <div className="feature-card">
            <FaHands className="feature-icon" />
            <h3>Sign Language Understanding</h3>
            <p>AI-powered sign language recognition for inclusive, accessible communication.</p>
            <Link to="/sign-language" className="feature-link">Try Now →</Link>
            </div>

            {/* Caption Generation */}
            <div className="feature-card">
            <FaClosedCaptioning className="feature-icon" />
            <h3>Caption Generation</h3>
            <p>Automatically generate captions for videos to ensure accessibility for all.</p>
            <Link to="/live-caption" className="feature-link">Try Now →</Link>
            </div>
        </div>
        </section>


      {/* Quote Section */}
      <section className="quote-section">
        <div className="quote-card">
        <p>
            “Every word, every gesture, every voice deserves to be understood.”
        </p>
        </div>
      </section>
      <footer className="footer">
  <p>
    © 2026 LinguaAI. This is an independent student project and is not affiliated with,
    endorsed by, or connected to any existing companies or services using similar names.
  </p>
</footer>
    </div>
  );
};

export default LoginPage;

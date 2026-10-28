import React, { useState } from "react";
import "./HeroFigma.css";

const CURVE =
  "M-700,104 C-400,104 -170,100 0,92 C140,84 230,34 370,32 C520,30 610,70 770,88 C920,104 1100,112 1440,108 C1700,105 1900,110 2140,110 L2140,420 L-700,420 Z";

export default function Hero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="hero-root">
      <section className="spice-hero" id="home">
        
        {/* --- Navbar --- */}
        <header className="hero-nav">
          {/* Logo - Locked to exact Figma position */}
          <a href="/" className="hero-logo">
            <img src="/images/logo.png" alt="The Spice Haven" />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hero-links">
            <a href="/about">About</a>
            <a href="/menu">Menu</a>
            <a href="/reservation">Reservation</a>
            <a href="/contact">Contact</a>
          </nav>

          {/* Right-Side Group: Location, Cart, Book Table (Desktop), Hamburger (Mobile) */}
          <div className="hero-right-actions">
            {/* Location Pin */}
            <a href="/location" className="hero-cart location-pin-icon" aria-label="Location">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <line x1="12" y1="12" x2="12" y2="19" stroke="#1f2937" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="12" cy="8" r="4.5" fill="#ff4d4d" />
                <circle cx="12" cy="8" r="1.8" fill="#ffe6e6" />
              </svg>
            </a>

            {/* Shopping Cart */}
            <a href="/cart" className="hero-cart" aria-label="Cart">
              <svg viewBox="0 0 24 24" width="55%" height="55%" fill="none">
                <path
                  d="M3 5h2l2.2 8.4a1.8 1.8 0 0 0 1.7 1.3h8.3a1.8 1.8 0 0 0 1.7-1.3L21 7.5H6.2"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9.5" cy="18.5" r="1.4" fill="currentColor" />
                <circle cx="16.5" cy="18.5" r="1.4" fill="currentColor" />
              </svg>
            </a>

            {/* Book Table Button (Desktop Only) */}
            <a href="/reservation" className="hero-nav-btn desktop-book-btn">
              Book Table
            </a>

            {/* Mobile Hamburger Toggle */}
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Menu List */}
        {mobileMenuOpen && (
          <div className="mobile-dropdown-menu">
            <ul className="mobile-nav-list">
              <li><a href="/about" onClick={() => setMobileMenuOpen(false)}>About</a></li>
              <li><a href="/menu" onClick={() => setMobileMenuOpen(false)}>Menu</a></li>
              <li><a href="/reservation" onClick={() => setMobileMenuOpen(false)}>Reservation</a></li>
              <li><a href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</a></li>
              <li><a href="/reservation" className="mobile-dropdown-btn" onClick={() => setMobileMenuOpen(false)}>Book Table</a></li>
            </ul>
          </div>
        )}

        {/* --- Hero Stage Content --- */}
        <div className="hero-stage">
          <div className="hero-copy">
            <h1>
              A Culinary Journey
              <br />
              Beyond the Plate
            </h1>
            <p className="hero-description">
              Create a place where flavour, culture, and togetherness come alive
              at the same table.
            </p>
            <div className="hero-actions">
              <a href="#menu" className="hero-btn hero-btn-outline">
                Order Now
              </a>
              <a href="#reservation" className="hero-btn hero-btn-primary">
                Book Table
              </a>
            </div>
          </div>

          <img
            src="/images/hero-plate.png"
            alt="Signature steak plate"
            className="sh-hero-image"
          />
        </div>

        {/* --- Grainy Wave Transition --- */}
        <div className="hero-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 173" preserveAspectRatio="xMidYMax meet">
            <defs>
              <filter
                id="grainEdgeHero"
                filterUnits="userSpaceOnUse"
                x="-900"
                y="-200"
                width="3240"
                height="800"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="soft" />
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.95"
                  numOctaves="2"
                  seed="5"
                  result="noise"
                />
                <feColorMatrix
                  in="noise"
                  type="matrix"
                  values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
                  result="noiseA"
                />
                <feComposite
                  in="soft"
                  in2="noiseA"
                  operator="arithmetic"
                  k1="0"
                  k2="1"
                  k3="1"
                  k4="-0.5"
                  result="mix"
                />
                <feComponentTransfer in="mix" result="dots">
                  <feFuncA type="linear" slope="14" intercept="-6.5" />
                </feComponentTransfer>
                <feFlood floodColor="#e8ddd3" result="flood" />
                <feComposite in="flood" in2="dots" operator="in" />
              </filter>
            </defs>
            <path filter="url(#grainEdgeHero)" d={CURVE} />
            <path fill="#e8ddd3" transform="translate(0 34)" d={CURVE} />
          </svg>
        </div>
      </section>
    </main>
  );
}
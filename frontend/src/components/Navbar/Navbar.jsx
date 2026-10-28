import React, { useState } from "react";
import { useCart } from "../../context/CartContext.jsx";
import "./Navbar.css";

// Precise wave path stretching edge-to-edge
const CURVE = "M-100,90 C360,165 540,25 900,105 C1200,155 1360,35 1540,65 L1540,250 L-100,250 Z";

export default function Navbar({ variant = "default", activeLink = "" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartItems } = useCart();

  // Calculate total items count safely
  const totalItemsCount = cartItems ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <>
      {/* --- Navbar --- */}
      <header className={`site-navbar ${variant === "hero" ? "site-navbar--hero" : ""}`}>
        <div className="site-navbar__inner">
          {/* Logo */}
          <a href="/" className="site-navbar__logo">
            <img src="/images/logo.png" alt="The Spice Haven" className="site-navbar__logo-img" />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="site-navbar__links">
            <a href="/about" className={activeLink === "about" ? "is-active" : ""}>About</a>
            <a href="/menu" className={activeLink === "menu" ? "is-active" : ""}>Menu</a>
            <a href="/reservation" className={activeLink === "reservation" ? "is-active" : ""}>Reservation</a>
            <a href="/contact" className={activeLink === "contact" ? "is-active" : ""}>Contact</a>
          </nav>

          {/* Right-Side Actions Group */}
          <div className="site-navbar__actions">
            {/* Location Pin */}
            <a href="/location" className="site-navbar__icon" aria-label="Location">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
                <line x1="12" y1="12" x2="12" y2="19" stroke="#1f2937" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="12" cy="8" r="4.5" fill="#ff4d4d" />
                <circle cx="12" cy="8" r="1.8" fill="#e8ddd3" />
              </svg>
            </a>

            {/* Shopping Cart with Notification Badge */}
            <a href="/cart" className="site-navbar__icon cart-icon-wrapper" aria-label="Cart">
              <svg viewBox="0 0 24 24" width="55%" height="55%" fill="none">
                <path
                  d="M3 5h2l2.2 8.4a1.8 1.8 0 0 0 1.7 1.3h8.3a1.8 1.8 0 0 0 1.7-1.3L21 7.5H6.2"
                  stroke="#d9782f"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9.5" cy="18.5" r="1.4" fill="#d9782f" />
                <circle cx="16.5" cy="18.5" r="1.4" fill="#d9782f" />
              </svg>
              {totalItemsCount > 0 && (
                <span className="cart-badge-notification">
                  {totalItemsCount}
                </span>
              )}
            </a>

            {/* Book Table Button (Desktop Only) */}
            <a href="/reservation" className="site-navbar__book site-navbar__desktop-book">
              Book Table
            </a>

            {/* Mobile Hamburger Toggle */}
            <button 
              className="site-navbar__hamburger" 
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
        </div>

        {/* --- Grainy Wave Transition --- */}
        <div className="site-navbar__wave" aria-hidden="true">
          <svg viewBox="0 0 1440 173" preserveAspectRatio="none">
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
      </header>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="site-navbar__mobile-menu">
          <ul className="site-navbar__mobile-list">
            <li><a href="/about" onClick={() => setMobileMenuOpen(false)}>About</a></li>
            <li><a href="/menu" onClick={() => setMobileMenuOpen(false)}>Menu</a></li>
            <li><a href="/reservation" onClick={() => setMobileMenuOpen(false)}>Reservation</a></li>
            <li><a href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</a></li>
            <li><a href="/reservation" className="site-navbar__mobile-book" onClick={() => setMobileMenuOpen(false)}>Book Table</a></li>
          </ul>
        </div>
      )}
    </>
  );
}
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const close = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`nv-header ${isHome ? "nv-home" : ""} ${scrolled ? "nv-scrolled" : ""}`}
    >
      <Link to="/" className="nv-logo" onClick={close}>
        <img
          src="/images/logo.png"
          alt="The Spice Haven"
          className="nv-logo-img"
        />
      </Link>

      <nav className={`nv-links ${open ? "nv-open" : ""}`}>
        <Link to="/about" onClick={close}>
          About
        </Link>
        <Link to="/menu" onClick={close}>
          Menu
        </Link>
        <Link to="/reservation" onClick={close}>
          Reservation
        </Link>
        <Link to="/contact" onClick={close}>
          Contact
        </Link>
      </nav>

      <Link to="/cart" className="nv-cart" aria-label="Cart">
        🛒
      </Link>
      <Link to="/reservation" className="nv-btn">
        Book Table
      </Link>

      <button
        className="nv-burger"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        ☰
      </button>
    </header>
  );
}

import { Link } from "react-router-dom";
import "./HeroFigma.css";

const icon = (children) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const features = [
  {
    label: "Fresh Ingredients",
    svg: icon(
      <>
        <path d="M6 14a4 4 0 0 1-1-7.9A5 5 0 0 1 12 3a5 5 0 0 1 7 3.1A4 4 0 0 1 18 14v6H6z" />
        <path d="M6 17h12" />
      </>,
    ),
  },
  {
    label: "Authentic Flavour",
    svg: icon(
      <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2 1-3 4-3 8h3" />,
    ),
  },
  {
    label: "Creative Dishes",
    svg: icon(
      <>
        <path d="M3 18h18M5 18a7 7 0 0 1 14 0M12 8V6" />
        <circle cx="12" cy="5" r="1" />
      </>,
    ),
  },
  {
    label: "Warm Hospitality",
    svg: icon(
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
    ),
  },
];

const CURVE =
  "M-700,104 C-400,104 -170,100 0,92 C140,84 230,34 370,32 C520,30 610,70 770,88 C920,104 1100,112 1440,108 C1700,105 1900,110 2140,110 L2140,420 L-700,420 Z";

export default function Hero() {
  return (
    <main className="hero-root">
      <section className="spice-hero" id="home">
        <div className="hero-stage">
          <header className="hero-nav">
            <Link to="/" className="hero-logo">
              <img src="/images/logo.png" alt="The Spice Haven" />
            </Link>

            <nav className="hero-links">
              <Link to="/about">About</Link>
              <Link to="/menu">Menu</Link>
              <Link to="/reservation">Reservation</Link>
              <Link to="/contact">Contact</Link>
            </nav>

            <Link to="/cart" className="hero-cart" aria-label="Cart">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="18" cy="20" r="1.4" />
                <path d="M2 3h3l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 7H6" />
              </svg>
            </Link>

            <Link to="/reservation" className="hero-nav-btn">
              Book Table
            </Link>
          </header>

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
        </div>

        <img
          src="/images/hero-plate.png"
          alt="Signature steak plate"
          className="sh-hero-image"
        />

        <div className="hero-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 173" preserveAspectRatio="xMidYMax meet">
            <defs>
              <filter
                id="grainEdge"
                filterUnits="userSpaceOnUse"
                x="-900"
                y="-200"
                width="3240"
                height="800"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="20"
                  result="soft"
                />
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

            {/* grain wali patti */}
            <path filter="url(#grainEdge)" d={CURVE} />
            {/* solid beige neeche */}
            <path fill="#e8ddd3" transform="translate(0 34)" d={CURVE} />
          </svg>
        </div>
      </section>

      <section className="hero-features-wrap" aria-label="Our qualities">
        <div className="hero-features">
          {features.map((f) => (
            <div className="hero-feature" key={f.label}>
              <span>{f.svg}</span>
              <p>{f.label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

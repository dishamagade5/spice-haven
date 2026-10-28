import { Link } from "react-router-dom";
import "./About.css";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Footer from "../../components/Footer/Footer.jsx";

const Icon = ({ paths }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {paths.map((d, i) => (
      <path key={i} d={d} />
    ))}
  </svg>
);

const ICONS = {
  leaf: [
    "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",
    "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
  ],
  utensils: [
    "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2",
    "M7 2v20",
    "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7",
  ],
  chef: [
    "M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z",
    "M6 17h12",
  ],
  heart: [
    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  ],
  wine: [
    "M8 22h8",
    "M7 10h10",
    "M12 15v7",
    "M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z",
  ],
};

const features = [
  { icon: "leaf", label: "Fresh Ingredients" },
  { icon: "utensils", label: "Authentic Flavour" },
  { icon: "chef", label: "Creative Dishes" },
  { icon: "heart", label: "Warm Hospitality" },
];

export default function About() {
  return (
    <>
      <Navbar />
      <main className="about-page">
        <div className="about-inner">
          {/* Banner */}
          <section className="about-banner">
            <h1>More Than Just Food</h1>
            <p>
              Authentic flavours, carefully prepared with fresh ingredients.
            </p>
          </section>

          {/* Our Story */}
          <section className="about-row">
            <div className="about-text">
              <h2>Our Story</h2>
              <p>
                The Spice Haven began with a dream — to create a place where
                flavour, culture, and togetherness come alive at the same table.
                <br />
                What started as a love for authentic Indian spices soon grew
                into a culinary journey inspired by flavours from across Asia
                and beyond. Today, every dish we serve tells a little story —
                from the smoky aroma of tandoori favourites to the bold flavours
                of Indian curries, the irresistible comfort of Chinese classics,
                and indulgent desserts made to end every meal on a sweet note.
              </p>
              <Link to="/menu" className="about-link">
                See Our Menu
              </Link>
            </div>
            <div className="about-img">
              <img
                src="/images/about-story.png"
                alt="Friends dining at The Spice Haven"
              />
            </div>
          </section>

          {/* More Than Just Food */}
          <section className="about-row reverse">
            <div className="about-img">
              <img
                src="/images/about-food.png"
                alt="Dining table at The Spice Haven"
              />
            </div>
            <div className="about-text">
              <h2>More Than Just Food</h2>
              <p>
                We believe a great restaurant isn't only about what's on the
                plate. It's about the first bite that makes you smile, the
                conversation that lasts longer than expected, the family
                gathering around one table, and the friends who say, "Let's
                order one more!" At The Spice Haven, we bring together
                traditional flavours and contemporary creativity to create food
                that feels familiar yet exciting.
              </p>
              <Link to="/reservation" className="about-link">
                Book Table Now
              </Link>
            </div>
          </section>

          {/* Feature strip */}
          <section className="about-features">
            {features.map((f) => (
              <div className="about-feature" key={f.label}>
                <span className="about-feature-icon">
                  <Icon paths={ICONS[f.icon]} />
                </span>
                <span>{f.label}</span>
              </div>
            ))}
          </section>

          {/* Chef */}
          <section className="about-chef">
            <div className="about-chef-text">
              <span className="about-chef-role">Head chef &amp; Founder</span>
              <h2>Chef Arjun Mehta</h2>
              <p>
                With a passion for bold flavours and a deep respect for culinary
                traditions, Chef Arjun brings together time-honoured recipes,
                fresh ingredients, and modern techniques to create the signature
                Spice Haven experience.
              </p>
              <div className="about-chef-points">
                <div className="about-chef-point">
                  <Icon paths={ICONS.chef} />
                  <span>
                    Signature
                    <br />
                    Techniques
                  </span>
                </div>
                <span className="about-chef-divider" />
                <div className="about-chef-point">
                  <Icon paths={ICONS.wine} />
                  <span>
                    Curated
                    <br />
                    Pairings
                  </span>
                </div>
              </div>
            </div>
            <div className="about-chef-photo">
              <img src="/images/about-chef.png" alt="Chef Arjun Mehta" />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

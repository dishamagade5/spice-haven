import { useRef } from "react";
import "./FeaturedDishes.css";

const dishes = [
  { name: "Kadai Paneer", price: 230, image: "/images/dish-kadai-paneer.png" },
  { name: "Gulab Jamun", price: 160, image: "/images/dish-gulab-jamun.png" },
  { name: "Biryani", price: 450, image: "/images/dish-biryani.png" },
  { name: "Noodles", price: 90, image: "/images/dish-noodles.png" },
];

const Chevron = ({ dir }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

export default function FeaturedDishes() {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.5, behavior: "smooth" });
  };

  return (
    <section className="fd-section" id="menu">
      <h2 className="fd-title">Delicious In Spice Heaven</h2>

      <div className="fd-carousel">
        <button
          className="fd-arrow fd-prev"
          onClick={() => scroll(-1)}
          aria-label="Previous"
        >
          <Chevron dir="left" />
        </button>

        <div className="fd-track" ref={trackRef}>
          {dishes.map((d) => (
            <article className="fd-card" key={d.name}>
              <div className="fd-img-wrap">
                <img src={d.image} alt={d.name} />
              </div>
              <div className="fd-info">
                <h3>{d.name}</h3>
                <p className="fd-price">₹ {d.price}/-</p>
                <button className="fd-order-btn">Order Now</button>
              </div>
            </article>
          ))}
        </div>

        <button
          className="fd-arrow fd-next"
          onClick={() => scroll(1)}
          aria-label="Next"
        >
          <Chevron dir="right" />
        </button>
      </div>

      <a href="/menu" className="fd-view-btn">
        View Menu
      </a>
    </section>
  );
}

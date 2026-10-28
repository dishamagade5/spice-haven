import "./Testimonials.css";

const reviews = [
  {
    name: "Rohan Sharma",
    text: "The Butter Chicken and Biryani were outstanding. Warm service and a beautiful ambience.",
  },
  {
    name: "Priya Verma",
    text: "Every dish was full of flavour and the presentation was stunning.",
  },
  {
    name: "Amit Patel",
    text: "Perfect place for a family dinner. The staff made our evening memorable.",
  },
];

export default function Testimonials() {
  return (
    <section className="ts-section" id="testimonials">
      <h2>Testimonials</h2>
      <div className="ts-grid">
        {reviews.map((r) => (
          <article className="ts-card" key={r.name}>
            <div className="ts-stars">★★★★★</div>
            <p>“{r.text}”</p>
            <strong>{r.name}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

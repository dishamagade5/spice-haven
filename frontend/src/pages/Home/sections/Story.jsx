import "./Story.css";

export default function Story() {
  return (
    <section className="st-section" id="story">
      <div className="st-text">
        <span className="st-label">The Story</span>
        <h2>An Unforgettable Dining Experience</h2>
        <p>
          The Spice Haven began with a dream — to create a place where flavour,
          culture, and togetherness come alive at the same table. What started
          as a love for authentic Indian spices soon grew into a culinary
          journey inspired by flavours from across Asia and beyond. Today, every
          dish we serve tells a little story — from the smoky aroma of tandoori
          favourites to the bold flavours of Indian curries, the irresistible
          comfort of Chinese classics, and indulgent desserts made to end every
          meal on a sweet note.
        </p>
        <a href="/about" className="st-btn">
          Discover Our Journey
        </a>
      </div>
      <div className="st-image">
        <img src="/images/story.png" alt="Signature dishes" />
      </div>
    </section>
  );
}

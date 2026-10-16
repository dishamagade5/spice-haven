import "./LuxuryDining.css";

export default function LuxuryDining() {
  return (
    <section className="ld-section">
      <div className="ld-collage">
        <img
          className="ld-main"
          src="/images/dining-main.png"
          alt="Luxury dining"
        />
        <img className="ld-top" src="/images/dining-top.png" alt="Bruschetta" />
        <img className="ld-small" src="/images/dining-small.png" alt="Pasta" />
      </div>

      <div className="ld-text">
        <h2>Luxury Dining</h2>
        <p>
          Experience luxury dining at The Spice Haven, where authentic Indian
          flavours meet culinary creativity. Savour exquisite dishes crafted
          with fresh ingredients, aromatic spices, and exceptional care, all
          served in an elegant, welcoming atmosphere designed to make every meal
          memorable.
        </p>
        <a href="#reservation" className="ld-btn">
          Book Table
        </a>
      </div>
    </section>
  );
}

import "./Gallery.css";

const images = [
  "/images/gallery-1.png",
  "/images/gallery-2.png",
  "/images/gallery-3.png",
  "/images/gallery-4.png",
];

export default function Gallery() {
  return (
    <section className="gl-section" id="gallery">
      <h2>Gallery</h2>

      <div className="gl-grid">
        {images.map((src, i) => (
          <div className={`gl-item gl-${i + 1}`} key={src}>
            <img src={src} alt={`Spice Haven gallery ${i + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

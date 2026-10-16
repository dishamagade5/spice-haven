import { useState } from 'react';
import { useCart, formatINR } from '../../context/CartContext.jsx';
import './FoodCard.css';

export default function FoodCard({ item }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const available = item.available !== false;
  const id = item.id ?? item.name;

  const handleAdd = () => {
    if (!available) return;
    addToCart({ ...item, id });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="food-card">
      <div className="food-image">
        <img src={item.image} alt={item.name} loading="lazy" />
        {!available && <span className="food-unavailable-tag">Unavailable</span>}
        {item.category && <span className="food-cat-tag">{item.category}</span>}
      </div>
      <div className="food-body">
        <div className="food-info">
          <h3>{item.name}</h3>
          <p className="food-meta">
            {[item.category, item.subcategory].filter(Boolean).join(' • ')}
          </p>
          <p>{item.description}</p>
          <strong>{formatINR(item.price)}</strong>
        </div>
        <button
          type="button"
          className={`food-add-btn ${added ? 'added' : ''}`}
          onClick={handleAdd}
          disabled={!available}
        >
          {!available ? 'Unavailable' : added ? 'Added ✓' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}


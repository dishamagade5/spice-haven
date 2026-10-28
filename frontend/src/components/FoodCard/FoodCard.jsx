import React from 'react';
import { useCart } from '../../context/CartContext'; // Adjust path if needed to point to your CartContext
import './FoodCard.css';

export default function FoodCard({ item, variant = 'default' }) {
  const { addToCart } = useCart();

  if (!item) return null;

  const {
    name,
    description,
    price,
    image,
    fallbackImage,
    category,
    subcategory,
    available = true,
  } = item;

  // Row variant matching your .food-row CSS classes
  if (variant === 'row') {
    return (
      <div className={`food-row ${!available ? 'is-unavailable' : ''}`}>
        <div className="food-row-thumb">
          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              onError={(e) => {
                if (fallbackImage && e.currentTarget.src !== fallbackImage) {
                  e.currentTarget.src = fallbackImage;
                }
              }}
            />
          ) : (
            <span>{name ? name.charAt(0) : ''}</span>
          )}
        </div>

        <div className="food-row-text">
          <h3>{name}</h3>
          <p>{description}</p>
        </div>

        <div className="food-row-side">
          <div className="food-row-pricebar">
            <span className="food-row-leader" aria-hidden="true" />
            <span className="food-row-price">₹{price}</span>
          </div>
          <button
            type="button"
            className="food-row-add"
            disabled={!available}
            onClick={() => addToCart(item)}
          >
            {available ? 'Add' : 'Sold Out'}
          </button>
        </div>
      </div>
    );
  }

  // Default block card variant
  return (
    <div className={`food-card ${!available ? 'is-unavailable' : ''}`}>
      <div className="food-image">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            onError={(e) => {
              if (fallbackImage && e.currentTarget.src !== fallbackImage) {
                e.currentTarget.src = fallbackImage;
              }
            }}
          />
        ) : null}
        {category && <span className="food-cat-tag">{category}</span>}
        {!available && <span className="food-unavailable-tag">Unavailable</span>}
      </div>

      <div className="food-body">
        <div className="food-info">
          {subcategory && <span className="food-meta">{subcategory}</span>}
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>₹{price}</strong>
          <button
            type="button"
            className="food-add-btn"
            disabled={!available}
            onClick={() => addToCart(item)}
          >
            {available ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}
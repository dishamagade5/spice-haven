import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import AuthModal from '../../components/AuthModal/AuthModal.jsx';
import { useCart, formatINR } from '../../context/CartContext.jsx';
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx';
import './Cart.css';

export default function Cart() {
  const { cartItems, increaseQuantity, decreaseQuantity, removeFromCart, cartTotal } = useCart();
  const { isCustomerLoggedIn } = useCustomerAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();

  const handleProceed = () => {
    if (cartItems.length === 0) return;
    if (isCustomerLoggedIn) navigate('/checkout');
    else setAuthOpen(true);
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <Navbar />
      <main className="simple-page cart-page">
        <div className="simple-inner cart-inner">
          <div className="eyebrow">Your Order</div>
          <h1>Your Cart</h1>
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty.</p>
              <Link to="/menu" className="home-button">Explore Menu</Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                {cartItems.map((row) => (
                  <div className="cart-row" key={row.id}>
                    {row.image && <img src={row.image} alt={row.name} className="cart-thumb" />}
                    <div className="cart-info">
                      <h3>{row.name}</h3>
                      <p className="cart-unit">{formatINR(row.price)} each</p>
                      <div className="qty-row">
                        <button type="button" onClick={() => decreaseQuantity(row.id)} aria-label="Decrease">−</button>
                        <span>{row.quantity}</span>
                        <button type="button" onClick={() => increaseQuantity(row.id)} aria-label="Increase">+</button>
                      </div>
                    </div>
                    <div className="cart-right">
                      <strong>{formatINR(row.subtotal ?? row.price * row.quantity)}</strong>
                      <button type="button" className="cart-remove" onClick={() => removeFromCart(row.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <aside className="cart-summary">
                <h3>Order Summary</h3>
                <div className="sum-row"><span>Subtotal</span><span>{formatINR(cartTotal)}</span></div>
                <div className="sum-row total"><span>Total</span><span>{formatINR(cartTotal)}</span></div>
                <button type="button" className="sh-primary-btn full" onClick={handleProceed}>Proceed to Order</button>
                <Link to="/menu" className="sh-secondary-btn full center">Continue Shopping</Link>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </>
  );
}

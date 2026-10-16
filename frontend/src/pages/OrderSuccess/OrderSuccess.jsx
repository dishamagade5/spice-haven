import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import { formatINR } from '../../context/CartContext.jsx';
import { fetchCustomerOrder } from '../../services/api.js';
import './OrderSuccess.css';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const location = useLocation();
  const [whatsappUrl, setWhatsappUrl] = useState(location.state?.whatsappUrl || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchCustomerOrder(orderId)
      .then((result) => {
        if (active) {
          setOrder(result);
          setWhatsappUrl(result?.whatsappUrl || '');
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load this order.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [orderId]);

  return (
    <>
      <Navbar />
      <main className="simple-page success-page">
        <div className="simple-inner success-inner">
          {loading ? (
            <><div className="eyebrow">Order Status</div><h1>Loading your order...</h1></>
          ) : error ? (
            <><div className="eyebrow">Order Status</div><h1>Unable to load order</h1><p role="alert">{error}</p></>
          ) : !order ? (
            <><div className="eyebrow">Order Status</div><h1>Order Not Found</h1><p>This order is not available in your account.</p></>
          ) : (
            <>
              <div className="success-tick">✓</div>
              <div className="eyebrow">Thank You</div>
              <h1>Thank You for Your Order – Visit Again!</h1>
              <p className="success-msg">Your order has been saved. We look forward to serving you again.</p>
              <div className="success-card">
                <div className="s-row"><span>Order ID</span><strong>{order.id}</strong></div>
                <div className="s-row"><span>Customer Name</span><strong>{order.customerName}</strong></div>
                <div className="s-row"><span>Phone</span><strong>{order.customerPhone}</strong></div>
                <div className="s-row"><span>Date</span><strong>{new Date(order.createdAt).toLocaleString('en-IN')}</strong></div>
                <div className="s-row"><span>Payment Method</span><strong>{order.paymentMethod === 'RAZORPAY_UPI' ? 'Razorpay UPI' : order.paymentMethod === 'ONLINE' ? 'Online (Demo)' : order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'Pay at Counter'}</strong></div>
                <div className="s-row"><span>Payment Status</span><strong>{order.paymentStatus === 'DEMO_PAID' ? 'Demo payment complete (no charge)' : order.paymentStatus}</strong></div>
                {order.razorpayPaymentId && <div className="s-row"><span>Razorpay Payment ID</span><strong>{order.razorpayPaymentId}</strong></div>}
                <div className="s-row"><span>Order Status</span><strong>{order.orderStatus}</strong></div>
                <div className="s-items">
                  <h3>Ordered Items</h3>
                  {order.items.map((item) => (
                    <div className="s-row" key={item.id}>
                      <span>{item.name} x {item.quantity}</span>
                      <span>{formatINR(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="s-row total"><span>Total</span><strong>{formatINR(order.totalAmount)}</strong></div>
              </div>
              <div className="success-actions">
                <Link to="/menu" className="home-button">Back to Menu</Link>
                <Link to="/my-dashboard" className="home-button alt">View My Dashboard</Link>
                {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" className="home-button alt">Continue on WhatsApp</a>}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

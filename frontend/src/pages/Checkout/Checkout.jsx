import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import { useCart, formatINR } from '../../context/CartContext.jsx';
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx';
import { createOrder, createRazorpayOrder, verifyRazorpayPayment } from '../../services/api.js';
import './Checkout.css';

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-razorpay-checkout]');
    const script = existingScript || document.createElement('script');
    const onLoad = () => resolve();
    const onError = () => {
      script.remove();
      reject(new Error('Could not load Razorpay checkout. Please try again.'));
    };
    if (existingScript) {
      script.addEventListener('load', onLoad, { once: true });
      script.addEventListener('error', onError, { once: true });
      return;
    }

    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = onLoad;
    script.onerror = onError;
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { customer, isCustomerLoggedIn, authReady } = useCustomerAuth();
  const [phone, setPhone] = useState(customer?.phone || '');
  // null = no choice yet.
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [cancelNote, setCancelNote] = useState('');
  const navigate = useNavigate();
  // Set to true once an order has been placed so the empty-cart guard below
  // does not fire while clearCart() propagates (avoids racing /menu vs
  // /order-success/:orderId).
  const orderPlacedRef = useRef(false);

  // Guard: wait until CustomerAuthContext has finished loading the stored
  // session before redirecting — prevents false redirects on first render.
  useEffect(() => {
    if (!authReady) return;
    if (orderPlacedRef.current) return;
    if (!isCustomerLoggedIn) {
      navigate('/cart', { replace: true });
      return;
    }
    if (cartItems.length === 0) {
      navigate('/menu', { replace: true });
    }
  }, [authReady, isCustomerLoggedIn, cartItems.length, navigate]);

  useEffect(() => {
    if (customer?.phone) setPhone(customer.phone);
  }, [customer?.phone]);

  if (!authReady) {
    return (
      <>
        <Navbar />
        <main className="simple-page checkout-page">
          <div className="simple-inner checkout-inner">
            <div className="eyebrow">Almost Done</div>
            <h1>Checkout</h1>
            <p>Loading your session...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!isCustomerLoggedIn) return null;
  if (cartItems.length === 0) return null;

  const handlePayNow = async () => {
    if (!phone.trim()) {
      setError('Add a phone number to your account before placing an order.');
      return;
    }
    setCancelNote('');
    setError('');
    setPlacing(true);
    try {
      await loadRazorpayCheckout();
      const paymentOrder = await createRazorpayOrder({
        items: cartItems.map((item) => ({ menuId: Number(item.id), quantity: item.quantity })),
      });
      if (!window.Razorpay) {
        throw new Error('Razorpay checkout did not initialize. Please try again.');
      }
      const checkout = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Spice Haven',
        description: `Order #${paymentOrder.orderId}`,
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: customer?.fullName || '',
          email: customer?.email || '',
          contact: phone,
        },
        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false,
          emi: false,
          paylater: false,
        },
        config: {
          display: {
            blocks: {
              upi: { name: 'Pay using UPI', instruments: [{ method: 'upi' }] },
            },
            sequence: ['block.upi'],
            preferences: { show_default_blocks: false },
          },
        },
        theme: { color: '#234a38' },
        handler: async (gatewayResponse) => {
          try {
            const confirmedOrder = await verifyRazorpayPayment({
              orderId: paymentOrder.orderId,
              ...gatewayResponse,
            });
            orderPlacedRef.current = true;
            clearCart();
            navigate(`/order-success/${confirmedOrder.id}`, {
              state: { whatsappUrl: confirmedOrder.whatsappUrl },
            });
          } catch (requestError) {
            setError(`Payment could not be verified. The order has not been marked paid. ${requestError.message || 'Please contact support before retrying.'}`);
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            setCancelNote('Payment cancelled. Your order is not marked as paid; you can try again.');
          },
        },
      });
      checkout.on('payment.failed', (response) => {
        setError(response.error?.description || 'Razorpay could not complete the payment. Please try again.');
        setPlacing(false);
      });
      checkout.open();
    } catch (requestError) {
      setError(requestError.message || 'Could not start Razorpay payment. Please try again.');
      setPlacing(false);
    }
  };

  const placeOrder = async (method) => {
    if (!phone.trim()) {
      setError('Add a phone number to your account before placing an order.');
      return;
    }
    setError('');
    setCancelNote('');
    setPlacing(true);
    try {
      const serverOrder = await createOrder({
        items: cartItems.map((item) => ({ menuId: Number(item.id), quantity: item.quantity })),
        paymentMethod: method,
      });
      orderPlacedRef.current = true;
      clearCart();
      navigate(`/order-success/${serverOrder.orderId}`, { state: { whatsappUrl: serverOrder.whatsappUrl } });
    } catch (requestError) {
      setError(requestError.message || 'Could not place your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const placeCashOnDeliveryOrder = () => {
    void placeOrder('CASH_ON_DELIVERY');
  };

  const openWhatsAppOrder = () => {
    const itemDetails = cartItems
      .map((item) => `• ${item.name} × ${item.quantity} — ${formatINR(item.subtotal ?? item.price * item.quantity)}`)
      .join('\n');
    const message = [
      'Hello Spice Haven, I would like to place an order:',
      '',
      itemDetails,
      '',
      `Total: ${formatINR(cartTotal)}`,
      `Customer name: ${customer?.fullName || 'Not provided'}`,
      `Phone: ${phone || 'Not provided'}`,
    ].join('\n');
    const whatsappUrl = `https://wa.me/917038456934?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Navbar />
      <main className="simple-page checkout-page">
        <div className="simple-inner checkout-inner">
          <div className="eyebrow">Almost Done</div>
          <h1>Checkout</h1>
          {error && <div className="sh-error">{error}</div>}
          {cancelNote && <div className="sh-info">{cancelNote}</div>}
          <div className="checkout-layout">
            <div className="checkout-left">
              <section className="checkout-card">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {customer?.fullName}</p>
                <p><strong>Email:</strong> {customer?.email}</p>
                <p><strong>Phone:</strong> {phone || 'Add a phone number to your account to place an order.'}</p>
              </section>
              <section className="checkout-card">
                <h3>Payment Method</h3>
                <div className="pay-cards">
                  <button type="button" className={paymentMethod === 'RAZORPAY_UPI' ? 'selected' : ''} onClick={() => setPaymentMethod('RAZORPAY_UPI')}>
                    <strong>Razorpay UPI</strong>
                    <span>Pay securely using a UPI app through Razorpay.</span>
                  </button>
                  <button type="button" className={paymentMethod === 'CASH_ON_DELIVERY' ? 'selected' : ''} onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}>
                    <strong>Cash on Delivery</strong>
                    <span>Pay in cash when your order is delivered.</span>
                  </button>
                </div>
                <button type="button" className="sh-primary-btn full" disabled={placing} onClick={() => { setPaymentMethod('RAZORPAY_UPI'); void handlePayNow(); }}>
                  {placing ? 'Starting Payment...' : 'Pay ' + formatINR(cartTotal) + ' with UPI'}
                </button>
                <button type="button" className="sh-primary-btn full" disabled={placing} onClick={() => { setPaymentMethod('CASH_ON_DELIVERY'); placeCashOnDeliveryOrder(); }} style={{ marginTop: '10px' }}>
                  {placing ? 'Placing Order...' : 'Place Cash on Delivery Order'}
                </button>
                <button type="button" className="sh-primary-btn full" disabled={placing} onClick={openWhatsAppOrder} style={{ marginTop: '10px' }}>
                  WhatsApp Order
                </button>
              </section>
            </div>
            <aside className="checkout-card summary">
              <h3>Order Summary</h3>
              {cartItems.map((row) => (
                <div className="sum-line" key={row.id}>
                  <span>{row.name} x {row.quantity}</span>
                  <span>{formatINR(row.subtotal ?? row.price * row.quantity)}</span>
                </div>
              ))}
              <div className="sum-row total"><span>Total Amount</span><span>{formatINR(cartTotal)}</span></div>
              <Link to="/cart" className="sh-secondary-btn full center">Back to Cart</Link>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

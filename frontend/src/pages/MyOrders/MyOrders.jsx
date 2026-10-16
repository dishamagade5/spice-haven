import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiBox,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCreditCard,
  FiMapPin,
  FiPackage,
  FiShoppingBag,
  FiUser,
} from 'react-icons/fi';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import { formatINR } from '../../context/CartContext.jsx';
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx';
import { fetchCustomerOrders, fetchCustomerProfile } from '../../services/api.js';
import './MyOrders.css';

const ORDER_STAGES = ['PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED'];

function formatDate(date) {
  return date ? new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }) : 'Date unavailable';
}

function paymentLabel(method) {
  if (method === 'RAZORPAY_UPI') return 'Razorpay UPI';
  if (method === 'ONLINE') return 'Online · Demo';
  if (method === 'CASH_ON_DELIVERY') return 'Cash on delivery';
  return 'Pay at counter';
}

function OrderCard({ order, expanded, onToggle }) {
  const currentStage = ORDER_STAGES.indexOf(order.orderStatus);
  const cancelled = order.orderStatus === 'CANCELLED';
  const paidDemo = order.paymentStatus === 'DEMO_PAID';

  return (
    <article className={`dashboard-order ${expanded ? 'is-expanded' : ''}`}>
      <div className="dashboard-order-top">
        <div className="dashboard-order-id">
          <span className="dashboard-order-icon"><FiPackage /></span>
          <div>
            <span className="dashboard-kicker">Order</span>
            <h3>#{order.id}</h3>
          </div>
        </div>
        <span className={`dashboard-status ${cancelled ? 'is-cancelled' : `is-${(order.orderStatus || 'pending').toLowerCase()}`}`}>
          <span />{order.orderStatus}
        </span>
      </div>

      <div className="dashboard-order-summary">
        <span><FiCalendar />{formatDate(order.createdAt)}</span>
        <span><FiShoppingBag />{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
        <strong>{formatINR(order.totalAmount)}</strong>
      </div>

      {!cancelled && (
        <div className="dashboard-tracking" aria-label={`Order tracking: ${order.orderStatus}`}>
          {ORDER_STAGES.map((stage, index) => (
            <div className={`tracking-step ${currentStage >= index ? 'is-reached' : ''} ${currentStage === index ? 'is-current' : ''}`} key={stage}>
              <span className="tracking-dot">{currentStage > index ? <FiCheckCircle /> : <span />}</span>
              <span>{stage === 'PREPARING' ? 'Preparing' : stage.charAt(0) + stage.slice(1).toLowerCase()}</span>
            </div>
          ))}
        </div>
      )}

      {cancelled && <p className="dashboard-cancel-note">This order was cancelled.</p>}

      <div className="dashboard-order-bottom">
        <span className={`dashboard-payment ${paidDemo ? 'is-demo' : ''}`}>
          <FiCreditCard />{paidDemo ? 'Demo complete · no charge' : `${paymentLabel(order.paymentMethod)} · ${order.paymentStatus}`}
        </span>
        <button type="button" className="dashboard-details-toggle" onClick={onToggle} aria-expanded={expanded}>
          {expanded ? 'Hide details' : 'Order details'} {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>

      {expanded && (
        <div className="dashboard-order-details">
          <div className="dashboard-detail-heading">
            <div><span className="dashboard-kicker">Your selection</span><h4>Order summary</h4></div>
            <span>{order.items.length} items</span>
          </div>
          <div className="dashboard-line-items">
            {order.items.map((item) => (
              <div className="dashboard-line-item" key={item.id}>
                <span className="dashboard-line-quantity">{item.quantity}×</span>
                <span>{item.name}</span>
                <strong>{formatINR(item.subtotal)}</strong>
              </div>
            ))}
          </div>
          <div className="dashboard-detail-total"><span>Total paid / due</span><strong>{formatINR(order.totalAmount)}</strong></div>
          {order.razorpayPaymentId && (
            <div className="dashboard-detail-total"><span>Razorpay payment ID</span><strong>{order.razorpayPaymentId}</strong></div>
          )}
          {order.whatsappUrl && (
            <a href={order.whatsappUrl} target="_blank" rel="noreferrer" className="dashboard-whatsapp-link">
              Continue this order on WhatsApp <FiArrowRight />
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export default function MyOrders() {
  const { customer: sessionCustomer, isCustomerLoggedIn, authReady } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [openId, setOpenId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(sessionCustomer);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authReady || !isCustomerLoggedIn) return;
    let active = true;
    Promise.all([fetchCustomerProfile(), fetchCustomerOrders()])
      .then(([customerProfile, customerOrders]) => {
        if (active) {
          setProfile(customerProfile);
          setOrders(customerOrders);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load your orders.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [authReady, isCustomerLoggedIn]);

  const metrics = useMemo(() => ({
    total: orders.length,
    active: orders.filter((order) => ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.orderStatus)).length,
    spent: orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
  }), [orders]);

  const visibleOrders = useMemo(() => (
    activeTab === 'Overview' ? orders.slice(0, 2) : orders
  ), [activeTab, orders]);

  if (!authReady) {
    return <><Navbar /><main className="customer-dashboard"><div className="dashboard-shell"><div className="dashboard-loading">Preparing your dashboard...</div></div></main><Footer /></>;
  }

  if (!isCustomerLoggedIn) {
    return (
      <>
        <Navbar />
        <main className="customer-dashboard">
          <div className="dashboard-shell dashboard-signin">
            <span className="dashboard-welcome-icon"><FiUser /></span>
            <span className="dashboard-kicker">A table just for you</span>
            <h1>Your Spice Haven account</h1>
            <p>Sign in to revisit your favorite orders and follow every order from kitchen to doorstep.</p>
            <Link to="/cart" className="dashboard-primary-link">Continue to sign in <FiArrowRight /></Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="customer-dashboard">
        <div className="dashboard-shell">
          <section className="dashboard-hero">
            <div className="dashboard-hero-content">
              <span className="dashboard-kicker"><span className="dashboard-kicker-mark">✦</span> YOUR SPICE HAVEN</span>
              <h1>A little something <em>just for you.</em></h1>
              <p>Welcome back{profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}. Your orders and all the details are right here.</p>
              <div className="dashboard-hero-note"><FiMapPin /> Freshly made, thoughtfully delivered.</div>
            </div>
            <div className="dashboard-hero-art" aria-hidden="true">
              <div className="dashboard-plate"><span>✦</span></div>
              <div className="dashboard-art-orbit orbit-one" />
              <div className="dashboard-art-orbit orbit-two" />
              <span className="dashboard-art-spark spark-one">✦</span>
              <span className="dashboard-art-spark spark-two">✧</span>
            </div>
            <span className="dashboard-hero-number">01</span>
          </section>

          {loading ? (
            <div className="dashboard-loading"><span className="dashboard-spinner" /> Gathering your account details...</div>
          ) : error ? (
            <div className="dashboard-error" role="alert"><FiClock />{error}</div>
          ) : (
            <>
              <section className="dashboard-metrics" aria-label="Account overview">
                <article className="dashboard-metric-card metric-orders">
                  <span className="metric-icon"><FiShoppingBag /></span>
                  <div><span className="dashboard-kicker">All time</span><strong>{metrics.total}</strong><span className="metric-label">Orders placed</span></div>
                  <span className="metric-decoration">01</span>
                </article>
                <article className="dashboard-metric-card metric-active">
                  <span className="metric-icon"><FiClock /></span>
                  <div><span className="dashboard-kicker">In the works</span><strong>{metrics.active}</strong><span className="metric-label">Active orders</span></div>
                  <span className="metric-decoration">02</span>
                </article>
                <article className="dashboard-metric-card metric-spent">
                  <span className="metric-icon"><FiCreditCard /></span>
                  <div><span className="dashboard-kicker">Your dining total</span><strong>{formatINR(metrics.spent)}</strong><span className="metric-label">Order value</span></div>
                  <span className="metric-decoration">03</span>
                </article>
              </section>

              <div className="dashboard-content">
                <section className="dashboard-main-panel">
                  <div className="dashboard-section-heading">
                    <div>
                      <span className="dashboard-kicker">YOUR ACCOUNT</span>
                      <h2>{activeTab === 'Profile' ? 'Personal details' : activeTab === 'Orders' ? 'Your order book' : 'Your table, your orders'}</h2>
                      <p>{activeTab === 'Profile' ? 'The details we use to make every order yours.' : 'Keep an eye on your favorites, from order placed to delivered.'}</p>
                    </div>
                    <Link to="/menu" className="dashboard-menu-link">Explore menu <FiArrowRight /></Link>
                  </div>

                  <div className="dashboard-tabs" role="tablist" aria-label="Dashboard sections">
                    {['Overview', 'Orders', 'Profile'].map((tab) => (
                      <button type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? 'is-active' : ''} key={tab} onClick={() => setActiveTab(tab)}>
                        {tab === 'Overview' ? <FiBox /> : tab === 'Orders' ? <FiPackage /> : <FiUser />}{tab}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'Profile' ? (
                    <div className="dashboard-profile-card">
                      <div className="profile-avatar">{(profile?.fullName || 'G').trim().charAt(0).toUpperCase()}</div>
                      <div className="profile-welcome"><span className="dashboard-kicker">SPICE HAVEN GUEST</span><h3>{profile?.fullName || 'Valued guest'}</h3><p>Your account details, all in one place.</p></div>
                      <div className="profile-fields">
                        <div><span>Full name</span><strong>{profile?.fullName || 'Not provided'}</strong></div>
                        <div><span>Email address</span><strong>{profile?.email || 'Not provided'}</strong></div>
                        <div><span>Phone number</span><strong>{profile?.phone || 'Not provided'}</strong></div>
                      </div>
                    </div>
                  ) : (
                    <div className="dashboard-orders-list">
                      {visibleOrders.length === 0 ? (
                        <div className="dashboard-empty">
                          <span className="dashboard-empty-icon"><FiShoppingBag /></span>
                          <span className="dashboard-kicker">THE FIRST OF MANY</span>
                          <h3>Your order story starts here.</h3>
                          <p>Explore our menu and find something delicious to make your own.</p>
                          <Link to="/menu" className="dashboard-primary-link">Discover the menu <FiArrowRight /></Link>
                        </div>
                      ) : (
                        <>
                          {visibleOrders.map((order) => (
                            <OrderCard key={order.id} order={order} expanded={openId === order.id} onToggle={() => setOpenId(openId === order.id ? null : order.id)} />
                          ))}
                          {activeTab === 'Overview' && orders.length > visibleOrders.length && (
                            <button type="button" className="dashboard-view-all" onClick={() => setActiveTab('Orders')}>View all {orders.length} orders <FiArrowRight /></button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </section>

                <aside className="dashboard-side-panel">
                  <div className="dashboard-side-heading"><span className="dashboard-side-icon"><FiUser /></span><div><span className="dashboard-kicker">YOUR PROFILE</span><h3>At a glance</h3></div></div>
                  <div className="dashboard-side-profile">
                    <div className="dashboard-side-avatar">{(profile?.fullName || 'G').trim().charAt(0).toUpperCase()}</div>
                    <div><strong>{profile?.fullName || 'Valued guest'}</strong><span>Spice Haven member</span></div>
                  </div>
                  <div className="dashboard-side-info"><span>Email</span><strong>{profile?.email || 'Not provided'}</strong></div>
                  <div className="dashboard-side-info"><span>Phone</span><strong>{profile?.phone || 'Not provided'}</strong></div>
                  <div className="dashboard-side-divider" />
                  <div className="dashboard-help"><span className="help-icon"><FiClock /></span><div><strong>Here for you</strong><p>Need help with an order? Reach out and we’ll be happy to help.</p></div></div>
                  <Link to="/contact" className="dashboard-contact-link">Get in touch <FiArrowRight /></Link>
                </aside>
              </div>
              <p className="dashboard-footer-note"><FiCheckCircle /> Your account details are kept safe and private.</p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

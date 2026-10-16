import { Link } from 'react-router-dom';
import '../simple-page.css';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Footer from '../../components/Footer/Footer.jsx';

export default function Contact() {
  return (
    <>
      <Navbar />
      <main className="simple-page">
        <div className="simple-inner">
          <div className="eyebrow">Get in touch</div>
          <h1>Contact Us</h1>
          <p>To plan your visit, send a reservation request and our restaurant team will follow up using the contact details you provide.</p>
          <Link to="/reservation" className="home-button">Book a Table</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

import { useState } from 'react';
import '../simple-page.css';
import Navbar from '../../components/Navbar/Navbar.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import { createReservation } from '../../services/api.js';

const today = new Date();
const minimumDate = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-');

export default function Reservation() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSent(false);
    const form = new FormData(event.currentTarget);
    try {
      await createReservation({
        customerName: form.get('customerName'),
        phoneNumber: form.get('phoneNumber'),
        email: form.get('email'),
        reservationDate: form.get('reservationDate'),
        reservationTime: form.get('reservationTime'),
        numberOfGuests: Number(form.get('numberOfGuests')),
        message: form.get('message'),
      });
      setSent(true);
      event.currentTarget.reset();
    } catch (requestError) {
      setError(requestError.message || 'Could not submit your reservation.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="simple-page">
        <div className="form-card">
          <div className="eyebrow">Reserve Your Table</div>
          <h1>Book a Table</h1>
          <form onSubmit={handleSubmit}>
            <input name="customerName" required maxLength="100" placeholder="Full Name" />
            <input name="phoneNumber" required type="tel" pattern="\+?[0-9]{10,13}" title="Enter a valid 10-13 digit phone number" placeholder="Phone" />
            <input name="email" required type="email" maxLength="150" placeholder="Email" />
            <input name="reservationDate" required type="date" min={minimumDate} />
            <input name="reservationTime" required type="time" />
            <input name="numberOfGuests" required type="number" min="1" max="30" placeholder="Guests" />
            <textarea name="message" maxLength="500" placeholder="Special Request" />
            <button className="home-button" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Confirm Reservation'}
            </button>
          </form>
          {error && <p className="sh-error" role="alert">{error}</p>}
          {sent && <p className="success" role="status">Reservation submitted successfully.</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}

import "./Contact.css";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Footer from "../../components/Footer/Footer.jsx";

export default function Contact() {
  return (
    <>
      <Navbar />
      <main className="contact-page">
        <div className="contact-inner">
          <div className="contact-info">
            <h2 className="contact-title">Our Location</h2>

            <div className="contact-block">
              <h3>Address</h3>
              <p>The Spice Haven, 1st Street, Goregaon East</p>
            </div>

            <div className="contact-row">
              <div className="contact-block">
                <h3>Phone Number</h3>
                <p>+91 83499 23949</p>
              </div>
              <div className="contact-block">
                <h3>Email</h3>
                <p className="contact-email">Spicehaven@gmail.com</p>
              </div>
            </div>

            <div className="contact-block">
              <h3>Opening Hr</h3>
              <p>Monday-Sunday , 8:00 AM to 11:00 PM</p>
            </div>

            <div className="contact-block">
              <h3>Website</h3>
              <p>spicehaven.in</p>
            </div>

            <a
              className="contact-whatsapp"
              href="https://wa.me/918349923949"
              target="_blank"
              rel="noreferrer"
            >
              Chat On Whatsapp
            </a>
          </div>

          <div className="contact-map">
            <img src="/images/map.png" alt="Map" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

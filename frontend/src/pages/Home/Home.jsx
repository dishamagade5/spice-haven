import Hero from "./sections/Hero";
import FeaturedDishes from "./sections/FeaturedDishes";
import LuxuryDining from "./sections/LuxuryDining";
import Story from "./sections/Story";
import Chef from "./sections/Chef";
import Testimonials from "./sections/Testimonials";
import Gallery from "./sections/Gallery";
import ContactCTA from "./sections/ContactCTA";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedDishes />
      <LuxuryDining />
      <Story />
      <Chef />
      <Testimonials />
      <Gallery />
      <ContactCTA />
      <Footer />
    </>
  );
}

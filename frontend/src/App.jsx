import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { CartProvider } from "./context/CartContext.jsx";
import { CustomerAuthProvider } from "./context/CustomerAuthContext.jsx"; // Added for auth flow

import Home from "./pages/Home/Home.jsx";
import About from "./pages/About/About.jsx";
import Contact from "./pages/Contact/Contact.jsx";
import MenuPage from "./pages/Menu/Menu.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Reservation from "./pages/Reservation/Reservation.jsx";

import AdminDashboard from "./admin/dashboard/AdminDashboard.jsx";
import Orders from "./admin/orders/Orders.jsx";

export default function App() {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </CustomerAuthProvider>
  );
}
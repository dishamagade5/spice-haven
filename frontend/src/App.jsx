import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home/Home.jsx';
import About from './pages/About/About.jsx';
import Contact from './pages/Contact/Contact.jsx';
import MenuPage from './pages/Menu/Menu.jsx';
import Cart from './pages/Cart/Cart.jsx';
import Reservation from './pages/Reservation/Reservation.jsx';
import Checkout from './pages/Checkout/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess/OrderSuccess.jsx';
import MyOrders from './pages/MyOrders/MyOrders.jsx';

import AdminDashboard from './admin/dashboard/AdminDashboard.jsx';
import Orders from './admin/orders/Orders.jsx';
import AdminLogin from './admin/auth/AdminLogin.jsx';
import MenuManagement from './admin/menu/MenuManagement.jsx';
import Reservations from './admin/reservations/Reservations.jsx';
import Customers from './admin/customers/Customers.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/my-dashboard" element={<MyOrders />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/menu" element={<MenuManagement />} />
        <Route path="/admin/customers" element={<Customers />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/reservations" element={<Reservations />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

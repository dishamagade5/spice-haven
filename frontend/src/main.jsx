import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { CartProvider } from './context/CartContext.jsx';
import { CustomerAuthProvider } from './context/CustomerAuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CustomerAuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </CustomerAuthProvider>
  </React.StrictMode>
);

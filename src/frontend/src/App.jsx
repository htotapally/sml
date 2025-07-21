import React, { useState, useMemo, useEffect, createContext, setCurrentPage, useContext, useRef } from 'react'
import './App.css'

import {loadStripe} from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// import { AuthProvider } from './components/AuthContext';

import { ThemeContext } from './components/ThemeContext'

import LoginPage from './components/LoginPage'
import HomePage from './components/HomePage'
import RegisterPage from './components/RegisterPage'
import ReportsPage from './components/ReportsPage'
import CartPage from './components/CartPage'
import ProductsPage from './components/ProductsPage'
import ProductCarousel from './components/ProductCarousel'
import OrderSummaryPage from './components/OrderSummaryPage'
import OrderConfirmationPage from './components/OrderConfirmationPage'

import Header from './components/Header'
import Footer from './components/Footer'
// import Reports from './components/Reports'

function App({ children }) {

  const [currentPage, setCurrentPage] = useState('home');
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [guestSessionId, setGuestSessionId] = useState(null); // New state for guest session ID
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);


  // Admin Auth Context
  // const AuthContext = createContext(AuthProvider);

  // API Base URL - Your backend API URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  console.log(API_BASE_URL)
  
  // Image Base URL - For images served by Nginx (e.g., your logo)
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
  console.log (IMAGE_BASE_URL)

  // const [loadingProducts, setLoadingProducts] = useState(false)

  // Function to fetch products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setProductError(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Added console.log for debugging fetch issues
      console.log('Fetching products from:', `${API_BASE_URL}/api/products`, 'with headers:', headers);

      const response = await fetch(`${API_BASE_URL}/api/products`, { headers });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      setProducts(data);

    } catch (error) {
      console.error('Error fetching products:', error);
      setProductError(error.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Effect to fetch products when component mounts (always fetch now)
  useEffect(() => {
    fetchProducts();
    setProducts(products)
  }, []); // Empty dependency array means it runs once on mount


  // Function to handle user login
  const handleLogin = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('storov_token', jwtToken);
    localStorage.setItem('storov_user', JSON.stringify(userData));
    localStorage.removeItem('storov_guest_session_id'); // Clear guest ID on login
    setGuestSessionId(null); // Clear guest ID state
    setCurrentPage('home');
  };

  // Function to handle user logout
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('storov_token');
    localStorage.removeItem('storov_user');
    // Do NOT clear guestSessionId here, as user might want to continue as guest
    setCurrentPage('home');
  };

  // Check for existing token/user/guestSessionId on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('storov_token');
    const storedUser = localStorage.getItem('storov_user');
    const storedGuestSessionId = localStorage.getItem('storov_guest_session_id');

    if (storedToken && storedUser) {
       try {
         setUser(JSON.parse(storedUser));
         setToken(storedToken);
       } catch (e) {
          console.error("Failed to parse stored user data:", e);
          handleLogout();
       }
     } else if (storedGuestSessionId) {
       setGuestSessionId(storedGuestSessionId);
     } else {
       // If no user and no guest ID, generate a new one for first-time guests
       // This is a placeholder for UUID generation in a browser environment
       // In a real app, you'd use a library like 'uuid' or a more robust guest session management
       const newGuestId = 'guest-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
       localStorage.setItem('storov_guest_session_id', newGuestId);
       setGuestSessionId(newGuestId);
     }
   }, []);

  const contextValue = useMemo(() => ({
    user,
    token, 
    handleLogin, 
    handleLogout, 
    API_BASE_URL, 
    IMAGE_BASE_URL, 
    setCurrentPage, 
    globalSearchQuery, 
    setGlobalSearchQuery, 
    guestSessionId, 
    setGuestSessionId}), 
    [ {user, token, handleLogin, handleLogout, API_BASE_URL, IMAGE_BASE_URL, setCurrentPage, globalSearchQuery, setGlobalSearchQuery, guestSessionId, setGuestSessionId }]);

  return (
    <ThemeContext.Provider value={contextValue}>

      <body>
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery}/>

        <main className="container mx-auto px-4 py-8">
          {currentPage === 'home' && (
            <HomePage products={products} loading={loadingProducts} error={productError} />
          )}

          {currentPage === 'login' && <LoginPage setCurrentPage={setCurrentPage} />}

          {currentPage === 'reports' && <ReportsPage setCurrentPage={setCurrentPage} />}

          {currentPage === 'register' && <RegisterPage setCurrentPage={setCurrentPage} />}


          {currentPage === 'products' && (
             <ProductsPage products={products} loading={loadingProducts} error={productError} fetchProducts={fetchProducts} globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery} />
           )}

           {currentPage === 'cart' && <CartPage setOrderSummary={setOrderSummary} setCurrentPage={setCurrentPage} />}
           {currentPage === 'orderSummary' && orderSummary && (
                    <OrderSummaryPage order={orderSummary} setCurrentPage={setCurrentPage} />
           )}

           {currentPage === 'confirmation' && orderConfirmation && (
                    <OrderConfirmationPage order={orderConfirmation} setCurrentPage={setCurrentPage} />
           )}
         </main>
        <Footer/>
      </body>
    </ThemeContext.Provider>
  )
}

export default App

import React, { useState, useEffect, setCurrentPage, useContext, useRef } from 'react'
import Register from './Register'

import { AuthProvider } from './AuthContext';
import { ThemeContext } from './ThemeContext'

function Header({ currentPage, setCurrentPage, globalSearchQuery, setGlobalSearchQuery }) {
  const { user, handleLogout, IMAGE_BASE_URL } = useContext(ThemeContext)

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      setCurrentPage('products');
    }
  };


  return (

            <header className="bg-white shadow-sm py-4">
              <div className="container mx-auto flex items-center justify-between px-4">
                {/* Logo and Store Title */}
                <div className="flex items-center space-x-4">
                  <button onClick={() => setCurrentPage('home')} className="flex items-center space-x-3 focus:outline-none">
                    <img src={`${IMAGE_BASE_URL}/images/storov_logo.jpg`} alt="Storov Logo" className="h-10 w-10 object-contain" style={{ borderRadius: '0.5rem' }} />
                    <span className="text-2xl font-bold text-green-700 text-left">
                      IBB Fresh <span className="font-normal text-gray-500 text-base">Powered by Storov</span>
                    </span>
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="hidden md:flex space-x-6 text-gray-700">
                  <button onClick={() => setCurrentPage('home')} className={`hover:text-green-700 ${currentPage === 'home' ? 'font-semibold text-green-700' : ''}`}>
                    Shop
                  </button>
                  <button className="hover:text-green-700">Services</button>
                  <button className="hover:text-green-700">Pickup & Delivery</button>
                </nav>

                {/* Search Bar */}
                <div className="flex-grow max-w-xl mx-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Products..."
                      className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={globalSearchQuery}
                      onChange={(e) => setGlobalSearchQuery(e.target.value)}
                      onKeyPress={handleSearchSubmit}
                    />
                    <button onClick={handleSearchSubmit} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:text-green-600 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </button>
                  </div>
                </div>

                {/* User Actions - MODIFIED FOR GUEST CART */}
                <div className="flex items-center space-x-4">
                  {/* Cart Button - Always visible now */}
                  <button onClick={() => setCurrentPage('cart')} className="relative p-2 rounded-full hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                    {/* Optional: Cart item count if implemented */}
                  </button>

                  {user ? (
                    <>
                      <span className="text-gray-700 hidden sm:block">Hello, {user.full_name || user.email}!</span>
                      <button onClick={handleLogout} className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setCurrentPage('login')} className="px-4 py-2 rounded-full border border-green-500 text-green-700 hover:bg-green-500 hover:text-white transition-colors">
                        Sign In
                      </button>
                      <button onClick={() => setCurrentPage('register')} className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors">
                        Register
                      </button>
                    </>
                  )}
                </div>
              </div>
            </header>

  );
}

export default Header;

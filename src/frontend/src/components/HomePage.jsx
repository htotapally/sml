import React, { useContext, useState, useEffect } from 'react'
import { ThemeContext } from './ThemeContext'

import ProductCarousel from './ProductCarousel'

function HomePage({ products, loading, error }) {

          const { user, token, API_BASE_URL, IMAGE_BASE_URL, setCurrentPage } = useContext(ThemeContext);

          // Define banner images for the new carousel banner
          const bannerImages = [
            `${IMAGE_BASE_URL}/images/banners/banner1.jpg`,
            `${IMAGE_BASE_URL}/images/banners/banner2.jpg`,
            `${IMAGE_BASE_URL}/images/banners/banner3.jpg`,
            `${IMAGE_BASE_URL}/images/banners/banner4.jpg`,
            `${IMAGE_BASE_URL}/images/banners/banner5.jpg`,
          ];
          const [currentSlide, setCurrentSlide] = useState(0);

          useEffect(() => {
            const slideInterval = setInterval(() => {
              setCurrentSlide((prevSlide) => (prevSlide + 1) % bannerImages.length);
            }, 5000); // Change slide every 5 seconds

            return () => clearInterval(slideInterval);
          }, [bannerImages.length]);

          // Filter products for "Shop Summer" carousel (example: products with 'Tea' in title)
          const shopSummerProducts = products.filter(p => p.title.includes('Tea')).slice(0, 7);

          // Filter products for "Start Your Order" (example: Dals & Lentils)
          const startOrderProducts = products.filter(p => p.categories && p.categories.includes('Dals & Lentils')).slice(0, 20);

          // New section for featured products
          const featuredProducts = products.slice(0, 20); // Show up to 20 featured products

          return (
            <div className="space-y-8">
              {/* Top Banner/Alert */}
              <div className="bg-yellow-100 text-yellow-800 p-3 text-center rounded-lg shadow-md">
                Order ahead from the Deli and Bakery for less prep and more party! <a href="#" className="font-semibold underline hover:text-yellow-900">Order Ahead →</a>
              </div>

              {/* NEW: Carousel Banner Section */}
              <section className="relative w-full overflow-hidden rounded-lg shadow-lg">
                <div className="flex transition-transform duration-500 ease-in-out"
                     style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                  {bannerImages.map((src, index) => (
                    <div key={index} className="flex-none w-full">
                      <img
                        src={src}
                        alt={`Promotional Banner ${index + 1}`}
                        className="w-full h-48 md:h-64 lg:h-80 object-cover rounded-lg"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/1200x300/007bff/ffffff?text=Banner+${index + 1}`; }}
                      />
                    </div>
                  ))}
                </div>
                {/* Carousel navigation dots */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {bannerImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-gray-400 bg-opacity-75'}`}
                      aria-label={`Go to slide ${index + 1}`}
                    ></button>
                  ))}
                </div>
              </section>

              {/* Product Carousels */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Featured Shopping Products</h2>
                  <button onClick={() => setCurrentPage('products')} className="ml-4 text-base text-green-600 hover:underline">
                    Shop All →
                  </button>
                </div>
                {/* Always display products if loaded, regardless of token */}
                {loading ? (
                  <p className="text-center text-gray-600">Loading products...</p>
                ) : error ? (
                  <p className="text-center text-red-500">Error: {error}.</p>
                ) : (
                  <ProductCarousel products={featuredProducts} />
                )}
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Start Your Order</h2>
                {/* Always display products if loaded, regardless of token */}
                {loading ? (
                  <p className="text-center text-gray-600">Loading products...</p>
                ) : error ? (
                  <p className="text-center text-red-500">Error: {error}.</p>
                ) : (
                  <ProductCarousel products={startOrderProducts} />
                )}
              </section>

              {/* Placeholder for other sections */}
              <section className="bg-gray-100 p-8 rounded-lg shadow-md text-center text-gray-700">
                <h3 className="text-xl font-semibold mb-2">More Storov Goodness</h3>
                <p>Explore our wide range of categories, find your favorite brands, and enjoy seamless shopping!</p>
                {/* Always show "Browse All Products" and navigate */}
                <button onClick={() => setCurrentPage('products')} className="mt-4 inline-block bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors shadow-md">
                  Browse All Products
                </button>
              </section>
            </div>
          );


}

export default HomePage;

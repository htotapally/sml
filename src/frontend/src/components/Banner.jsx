import React, { useState, useEffect, useContext } from 'react'
import { ThemeContext } from './ThemeContext'

function Banner() {

  const { IMAGE_BASE_URL } = useContext(ThemeContext);

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

  return (

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
  );
}

export default Banner;

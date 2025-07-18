import React, { useContext, useRef } from 'react'
import ProductCard from './ProductCard'

function ProductCarousel({products}) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
       const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8; // Scroll 80% of the visible width
       if (direction === 'left') {
         scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
       } else {
         scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
       }
     }
   };

   return (
     <div className="relative">
        <div ref={scrollContainerRef} className="flex overflow-x-auto space-x-4 p-4 -m-4 hide-scrollbar">
           {products.length > 0 ? (
              products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
            <p className="text-gray-500 w-full text-center py-8">No products found for this section.</p>
          )}
        </div>

        {/* Navigation Arrows */}
        {products.length > 5 && (
           <>
             <button
               onClick={() => scroll('left')}
               className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 focus:outline-none"
               aria-label="Scroll left"
               style={{ zIndex: 10 }}
             >

               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
              </button>

               <button
                 onClick={() => scroll('right')}
                 className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 focus:outline-none"
                 aria-label="Scroll right" style={{ zIndex: 10 }}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
               </button>
              </>
        )}
     </div>
  );
}

export default ProductCarousel;

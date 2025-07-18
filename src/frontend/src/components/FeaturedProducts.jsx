import React from 'react'

function FeaturedProducts(products) {

  const productsArray = products['products']

  // Filter products for "Shop Summer" carousel (example: products with 'Tea' in title)
  const shopSummerProducts = productsArray.filter(p => p.title.includes('Tea')).slice(0, 7);

  // Filter products for "Start Your Order" (example: Dals & Lentils)
  const startOrderProducts = productsArray.filter(p => p.categories && p.categories.includes('Dals & Lentils')).slice(0, 20);

  // New section for featured products
  const featuredProducts = productsArray.slice(0, 10); // Show up to 20 featured products


  return (

    <div className="space-y-8">
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Featured Shopping Products</h2>
                  <button onClick={() => setCurrentPage('products')} className="ml-4 text-base text-green-600 hover:underline">
                    Shop All →
                  </button>
                </div>
              </section>
    </div>
  );
}

export default FeaturedProducts;

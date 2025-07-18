import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext } from './ThemeContext'

import ProductCard from './ProductCard'

function ProductsPage({ products, loading, error, fetchProducts }) {

          const { token, API_BASE_URL } = useContext(ThemeContext);
          const [searchParams, setSearchParams] = useState({
            q: '',
            category: '',
            brand: '',
            min_price: '',
            max_price: '',
            availability: '',
            sort_by: 'title_asc',
            limit: 20,
            offset: 0
          });
          const [allProducts, setAllProducts] = useState([]); // To store products from this page's fetch
          const [pageLoading, setPageLoading] = useState(false);
          const [pageError, setPageError] = useState(null);
          const { globalSearchQuery, setGlobalSearchQuery } = useContext(ThemeContext); // Access global search state

          // Initialize search query from global state on mount
          useEffect(() => {
            if (globalSearchQuery && searchParams.q !== globalSearchQuery) {
              setSearchParams(prevParams => ({ ...prevParams, q: globalSearchQuery, offset: 0 }));
              setGlobalSearchQuery(''); // Clear global search after applying
            }
          }, [globalSearchQuery]);


          const handleSearchChange = (e) => {
            setSearchParams({ ...searchParams, [e.target.name]: e.target.value, offset: 0 }); // Reset offset on new search/filter
          };

          const handleFilterChange = (e) => {
            setSearchParams({ ...searchParams, [e.target.name]: e.target.value, offset: 0 });
          };

          const handleSortChange = (e) => {
            setSearchParams({ ...searchParams, sort_by: e.target.value });
          };

          const handlePagination = (newOffset) => {
            setSearchParams({ ...searchParams, offset: newOffset });
          };

          const fetchFilteredProducts = async () => {
            // Products page no longer requires token, but if it exists, send it.
            // setPageError('Please log in to view products.'); // Removed this error message
            // return; // Removed this return

            setPageLoading(true);
            setPageError(null);

            const query = new URLSearchParams();
            for (const key in searchParams) {
              if (searchParams[key]) {
                query.append(key, searchParams[key]);
              }
            }

            try {
              const headers = { 'Content-Type': 'application/json' };
              if (token) { // Only add Authorization header if token exists
                headers['Authorization'] = `Bearer ${token}`;
              }
              const response = await fetch(`${API_BASE_URL}/api/products?${query.toString()}`, {
                headers: headers // Use the headers object
              });
              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch products with filters');
              }
              setAllProducts(data);
            } catch (err) {
              console.error('Error fetching filtered products:', err);
              setPageError(err.message);
            } finally {
              setPageLoading(false); // Corrected from setLoading to setPageLoading
            }
          };

          // Fetch products when searchParams or token changes
          useEffect(() => {
            // Products should always be fetched now, regardless of token
            fetchFilteredProducts();
          }, [searchParams, token]); // Keep token in dependency array to re-fetch on login/logout


          return (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">All Products</h2>

              {/* Search and Filter/Sort Controls */}
              <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Search Input */}
                <div>
                  <label htmlFor="q" className="block text-sm font-medium text-gray-700">Search</label>
                  <input
                    type="text"
                    id="q"
                    name="q"
                    placeholder="Search by title, tag..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    value={searchParams.q}
                    onChange={handleSearchChange}
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    id="category"
                    name="category"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    value={searchParams.category}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Categories</option>
                    <option value="Dals & Lentils">Dals & Lentils</option>
                    <option value="Flours">Flours</option>
                    <option value="Rice">Rice</option>
                    <option value="Spices & Masalas">Spices & Masalas</option>
                    <option value="Dairy & Alternatives">Dairy & Alternatives</option>
                    <option value="Snacks & Ready-to-Eat">Snacks & Ready-to-Eat</option>
                    <option value="Pickles & Chutneys">Pickles & Chutneys</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    placeholder="e.g., SWAD"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    value={searchParams.brand}
                    onChange={handleFilterChange}
                  />
                </div>

                {/* Price Range */}
                <div className="md:col-span-2 lg:col-span-1 grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="min_price" className="block text-sm font-medium text-gray-700">Min Price</label>
                    <input
                      type="number"
                      id="min_price"
                      name="min_price"
                      placeholder="Min"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      value={searchParams.min_price}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="max_price" className="block text-sm font-medium text-gray-700">Max Price</label>
                    <input
                      type="number"
                      id="max_price"
                      name="max_price"
                      placeholder="Max"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      value={searchParams.max_price}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-700">Availability</label>
                  <select
                    id="availability"
                    name="availability"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    value={searchParams.availability}
                    onChange={handleFilterChange}
                  >
                    <option value="">All</option>
                    <option value="IN_STOCK">In Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="PREORDER">Preorder</option>
                    <option value="BACKORDER">Backorder</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label htmlFor="sort_by" className="block text-sm font-medium text-gray-700">Sort By</label>
                  <select
                    id="sort_by"
                    name="sort_by"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    value={searchParams.sort_by}
                    onChange={handleSortChange}
                  >
                    <option value="title_asc">Title (A-Z)</option>
                    <option value="title_desc">Title (Z-A)</option>
                    <option value="price_asc">Price (Low to High)</option>
                    <option value="price_desc">Price (High to Low)</option>
                  </select>
                </div>
              </div>

              {pageLoading ? (
                <p className="text-center text-gray-600 py-12">Loading products...</p>
              ) : pageError ? (
                <p className="text-center text-red-500 py-12">Error: {pageError}</p>
              ) : allProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No products found matching your criteria.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {allProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex justify-center items-center space-x-4 mt-8">
                    <button
                      onClick={() => handlePagination(searchParams.offset - searchParams.limit)}
                      disabled={searchParams.offset === 0 || pageLoading}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-gray-700">
                      Page {Math.floor(searchParams.offset / searchParams.limit) + 1}
                    </span>
                    <button
                      onClick={() => handlePagination(searchParams.offset + searchParams.limit)}
                      disabled={allProducts.length < searchParams.limit || pageLoading}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          );

}

export default ProductsPage;

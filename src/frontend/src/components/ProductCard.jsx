import React, { useContext, useState }  from 'react'
import { AuthProvider } from './AuthContext';
import { ThemeContext } from './ThemeContext'


function ProductCard({product}) {

  const { user, token, IMAGE_BASE_URL, API_ORDER_URL, guestSessionId, setGuestSessionId } = useContext(ThemeContext);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleAddToCart = async () => {
  // No longer check for token here, allow guests to add
  setMessage('');
  setMessageType('');
  setAddingToCart(true);

  console.log('Executing handleToCart')
  // console.log(localStorage.getItem('storov_token'));
  // console.log('token:' + token)
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      console.log('token is not null')
      headers['Authorization'] = `Bearer ${token}`;
      // headers['Authorization'] = `Bearer ${jwtToken}`;
    } else if (guestSessionId) {
      headers['X-Guest-Session-Id'] = guestSessionId; // Send guest ID for anonymous cart
    } else {
      // This case should ideally not happen if App component generates guestSessionId on load
      setMessage('Error: No session found. Please refresh the page.');
      setMessageType('error');
      setAddingToCart(false);
      return;
    }

    const response = await fetch(`${API_ORDER_URL}/api/cart/add`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ product_id: product.id, quantity: 1 })
    });

    console.log("guestSessionId: " + guestSessionId)

    // Check for new guest session ID from response headers
    const newGuestIdHeader = response.headers.get('X-New-Guest-Session-Id');
    console.log(newGuestIdHeader)

    if (newGuestIdHeader && newGuestIdHeader !== guestSessionId) {
      localStorage.setItem('storov_guest_session_id', newGuestIdHeader);
      setGuestSessionId(newGuestIdHeader);
    }

    const data = await response.json();

    if (response.ok) {
      setMessage(data.message || 'Item added to cart!');
      setMessageType('success');
    } else {
      throw new Error(data.message || 'Failed to add item to cart.');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    setMessage(error.message);
    setMessageType('error');
  } finally {
    setAddingToCart(false);
    setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
  }
};

// Fallback image for broken URLs
const handleImageError = (e) => {
  e.target.onerror = null; // Prevent infinite loop if fallback also fails
  e.target.src = `https://placehold.co/150x150/cccccc/333333?text=${encodeURIComponent(product.title.substring(0, 10))}...`;
};

// Construct the image URI using IMAGE_BASE_URL
const productImageUrl = product.images && product.images[0] && product.images[0].uri
  ? product.images[0].uri.replace('http://localhost', IMAGE_BASE_URL)
  : `https://placehold.co/150x150/cccccc/333333?text=No+Image`;

          return (
            <div className="flex-none w-48 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <img
                src={productImageUrl}
                alt={product.title}
                className="w-full h-32 object-contain p-2"
                onError={handleImageError}
              />
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 truncate mb-1">{product.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{product.brands && product.brands.join(', ')}</p>
                <p className="text-lg font-bold text-green-700 mb-3">${parseFloat(product.price_info?.price).toFixed(2) || 'N/A'}</p>

                {/* Always show "Add to Cart" button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-green-500 text-white py-2 rounded-full text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={addingToCart}
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                {message && (
                  <p className={`text-xs mt-2 text-center ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                  </p>
                )}
              </div>
            </div>
          );

}

export default ProductCard;

import React, { useState, useContext, useEffect }  from 'react'
import { ThemeContext } from './ThemeContext'

function CartPage({ setOrderSummary, setCurrentPage }) {

          const { user, token, API_BASE_URL, IMAGE_BASE_URL, guestSessionId, setGuestSessionId } = useContext(ThemeContext);
          const [cart, setCart] = useState(null);
          const [loading, setLoading] = useState(true);
          const [error, setError] = useState(null);
          const [message, setMessage] = useState('');
          const [messageType, setMessageType] = useState('');
          const [showGuestForm, setShowGuestForm] = useState(false); // State to control guest form visibility
          const [guestDetails, setGuestDetails] = useState({ // State for guest form data
            guest_full_name: '',
            guest_email: '',
            guest_phone_number: '',
            guest_address_line1: '',
            guest_address_line2: '',
            guest_city: '',
            guest_state: '',
            guest_zip_code: ''
          });
          const [showStripeModal, setShowStripeModal] = useState(false);
          const [stripe, setStripe] = useState(null);
          const [elements, setElements] = useState(null);
          const [paymentLoading, setPaymentLoading] = useState(false);
          const [paymentError, setPaymentError] = useState(null);
          const [paymentSuccess, setPaymentSuccess] = useState(null);

          const handleGuestDetailsChange = (e) => {
            setGuestDetails({ ...guestDetails, [e.target.id]: e.target.value });
          };

          const fetchCart = async () => {
            setLoading(true);
            setError(null);
            try {
              const headers = { 'Content-Type': 'application/json' };
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              } else if (guestSessionId) {
                headers['X-Guest-Session-Id'] = guestSessionId;
              } else {
                // If no user and no guest ID, means a new guest, so generate a new guest session ID
                // This is a placeholder for UUID generation in a browser environment
                const newGuestId = 'guest-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                localStorage.setItem('storov_guest_session_id', newGuestId);
                setGuestSessionId(newGuestId);
                headers['X-Guest-Session-Id'] = newGuestId; // Send the newly generated ID
              }

              const response = await fetch(`${API_BASE_URL}/api/cart`, { headers });
              const data = await response.json();

              // Check for new guest session ID from response headers
              const newGuestIdHeader = response.headers.get('X-New-Guest-Session-Id');
              if (newGuestIdHeader && newGuestIdHeader !== guestSessionId) {
                  localStorage.setItem('storov_guest_session_id', newGuestIdHeader);
                  setGuestSessionId(newGuestIdHeader);
              }

              if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch cart.');
              }
              setCart(data);
            } catch (err) {
              console.error('Error fetching cart:', err);
              setError(err.message);
            } finally {
              setLoading(false);
            }
          };

          useEffect(() => {
            fetchCart();
          }, [token, guestSessionId]); // Re-fetch cart if guestSessionId changes

          const handleUpdateQuantity = async (productId, newQuantity) => {
            if (!token && !guestSessionId) return; // Must have a session
            setMessage('');
            setMessageType('');
            try {
              const headers = { 'Content-Type': 'application/json' };
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              } else if (guestSessionId) {
                headers['X-Guest-Session-Id'] = guestSessionId;
              }

              const response = await fetch(`${API_BASE_URL}/api/cart/update/${productId}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({ quantity: newQuantity })
              });
              const data = await response.json();
              if (response.ok) {
                setMessage(data.message || 'Cart updated.');
                setMessageType('success');
                fetchCart(); // Re-fetch cart to update UI
              } else {
                throw new Error(data.message || 'Failed to update cart.');
              }
            } catch (err) {
              console.error('Error updating cart:', err);
              setMessage(err.message);
              setMessageType('error');
            } finally {
              setTimeout(() => setMessage(''), 3000);
            }
          };

          const handleRemoveItem = async (productId) => {
            if (!token && !guestSessionId) return; // Must have a session
            setMessage('');
            setMessageType('');
            try {
              const headers = {};
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              } else if (guestSessionId) {
                headers['X-Guest-Session-Id'] = guestSessionId;
              }

              const response = await fetch(`${API_BASE_URL}/api/cart/remove/${productId}`, {
                method: 'DELETE',
                headers: headers
              });
              const data = await response.json();
              if (response.ok) {
                setMessage(data.message || 'Item removed.');
                setMessageType('success');
                fetchCart(); // Re-fetch cart to update UI
              } else {
                throw new Error(data.message || 'Failed to remove item.');
              }
            } catch (err) {
              console.error('Error removing item:', err);
              setMessage(err.message);
              setMessageType('error');
            } finally {
              setTimeout(() => setMessage(''), 3000);
            }
          };

          const handlePlaceOrder = async () => {
            if (!token && !guestSessionId) {
              setMessage('Error: No cart session found.');
              setMessageType('error');
              return;
            }

            if (!user && !showGuestForm) {
              setShowGuestForm(true); // Show guest form if not logged in and not already showing
              setMessage('Please provide your details for guest checkout.');
              setMessageType('info');
              return;
            }

            setMessage('');
            setMessageType('');

            try {
              const headers = { 'Content-Type': 'application/json' };
              let bodyData = {};

              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
                // No extra body needed for logged-in user, backend gets details from JWT
              } else {
                // For guest checkout, send guest details from form
                headers['X-Guest-Session-Id'] = guestSessionId;
                bodyData = guestDetails; // Send guest form data
                // Basic validation for guest details
                if (!guestDetails.guest_full_name || !guestDetails.guest_email || !guestDetails.guest_address_line1 || !guestDetails.guest_city || !guestDetails.guest_state || !guestDetails.guest_zip_code) {
                    setMessage('Please fill in all required guest details.');
                    setMessageType('error');
                    return;
                }
              }

              const response = await fetch(`${API_BASE_URL}/api/orders/place`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(bodyData)
              });

              const data = await response.json();


              if (response.ok) {
                setOrderSummary(data.order);
                setCurrentPage('orderSummary');
                setMessage(data.message || 'Order placed successfully!');
                setMessageType('success');
                setCart({ cart_id: cart.cart_id, items: [] }); // Clear cart locally
                localStorage.removeItem('storov_guest_session_id'); // Clear guest session after successful order
                setGuestSessionId(null); // Clear guest ID state
                setShowGuestForm(false); // Hide form
              } else {
                throw new Error(data.message || 'Failed to place order.');
              }
            } catch (err) {
              console.error('Error placing order:', err);
              setMessage(err.message);
              setMessageType('error');
            } finally {
              setTimeout(() => setMessage(''), 3000);
            }
          };

          const calculateTotal = () => {
            if (!cart || !cart.items) return '0.00';
            const total = cart.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
            return total.toFixed(2);
          };

          // Load Stripe.js
          useEffect(() => {
            if (window.Stripe && !stripe) {
              setStripe(window.Stripe('pk_test_51NjlI6F6t61ArRgats1cW8M9CaixNaHTvwSwbwV3EYQMf1Xg58N8LrZuwDe5H1AsQYkKCfGItZAHnCUWKpfvo8WP00KxpUSIRL'));
            }
          }, []);

          // Open Stripe modal
          const handleStripeCheckout = () => {
            setShowStripeModal(true);
            setPaymentError(null);
            setPaymentSuccess(null);
            setTimeout(() => {
              if (stripe && !elements) {
                const stripeElements = stripe.elements();
                setElements(stripeElements);
                if (!document.getElementById('card-element').children.length) {
                  const card = stripeElements.create('card');
                  card.mount('#card-element');
                }
              }
            }, 200);
          };

          // Handle payment submission
          const handleStripePayment = async (e) => {
            e.preventDefault();
            setPaymentLoading(true);
            setPaymentError(null);
            setPaymentSuccess(null);
            try {
              // 1. Get client secret from backend
              const response = await fetch(`${API_BASE_URL}/api/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseInt(parseFloat(calculateTotal()) * 100) }) // amount in cents
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.message || 'Failed to create payment intent');
              const clientSecret = data.clientSecret;
              // 2. Confirm card payment
              const cardElement = elements.getElement('card');
              const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                  card: cardElement,
                },
              });
              if (result.error) {
                setPaymentError(result.error.message);
              } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                setPaymentSuccess('Payment successful!');
                setShowStripeModal(false);
                // Place order with payment_intent_id
                let orderBody = { payment_intent_id: result.paymentIntent.id };
                if (!user) {
                  orderBody = { ...guestDetails, payment_intent_id: result.paymentIntent.id };
                }

                const headers = {  'Content-Type': 'application/json',
                  ...(guestSessionId ? { 'X-Guest-Session-Id': guestSessionId } : {})
                }

                if(user) {
                  headers['Authorization'] = `Bearer ${token}`;
                }
               
                const orderResponse = await fetch(`${API_BASE_URL}/api/orders/place`, {
                  method: 'POST',
                  headers: headers,
                  body: JSON.stringify(orderBody)
                });


                if(orderResponse.status == '201') {
                  const por = await orderResponse.json()
                  const od = por.order
                  setOrderSummary(od)
                }

                if (!orderResponse.ok) {
                  setMessage(orderData.message || 'Order placement failed.');
                  setMessageType('error');
                } else {
                  /*
                  const orderData = await orderResponse.json();
                  console.log('oderData')
                  console.log(oderData)
                  setOrderSummary(orderData.order);
                  */
                  setCurrentPage('orderSummary');
                  // setMessage(orderData.message || 'Order placed successfully!');
                  setMessageType('success');
                  setCart({ cart_id: cart.cart_id, items: [] }); // Clear cart locally
                  localStorage.removeItem('storov_guest_session_id'); // Clear guest session after successful order
                  setGuestSessionId(null); // Clear guest ID state
                  setShowGuestForm(false); // Hide form
                }
              }
            } catch (err) {
              setPaymentError(err.message);
            } finally {
              setPaymentLoading(false);
              setTimeout(() => setMessage(''), 3000);
            }
          };

          // Add a helper to check if guest details are valid
          const isGuestDetailsValid = () => {
            return (
              guestDetails.guest_full_name.trim() &&
              guestDetails.guest_email.trim() &&
              guestDetails.guest_address_line1.trim() &&
              guestDetails.guest_city.trim() &&
              guestDetails.guest_state.trim() &&
              guestDetails.guest_zip_code.trim()
            );
          };

          // Display message if not logged in and no cart loaded
          if (!user && !loading && !error && (!cart || cart.items.length === 0)) {
            return (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">Your cart is empty. Browse products to add items.</p>
                <p className="text-md text-gray-500 mt-2">You can add items as a guest, or <button onClick={() => setCurrentPage('login')} className="font-medium text-green-600 hover:text-green-500">Sign In</button> for a personalized experience.</p>
              </div>
            );
          }

          return (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Shopping Cart</h2>

              {message && (
                <div className={`p-3 mb-4 rounded-md text-center ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message}
                </div>
              )}

              {loading ? (
                <p className="text-center text-gray-600 py-8">Loading cart...</p>
              ) : error ? (
                <p className="text-center text-red-500 py-8">Error: {error}</p>
              ) : cart && cart.items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Your cart is empty.</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {cart.items.map(item => (
                      <div key={item.product_id} className="flex items-center p-4 border border-gray-200 rounded-lg shadow-sm">
                        <img
                          src={item.image_uri ? item.image_uri.replace('http://localhost', IMAGE_BASE_URL) : `https://placehold.co/80x80/cccccc/333333?text=No+Image`}
                          alt={item.title}
                          className="w-20 h-20 object-contain rounded-md mr-4"
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/cccccc/333333?text=${encodeURIComponent(item.title.substring(0, 5))}...`; }}
                        />
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                          <p className="text-gray-600">${parseFloat(item.price).toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.product_id)}
                            className="ml-4 text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg text-right">
                    <h3 className="text-xl font-bold text-gray-800">Total: ${calculateTotal()}</h3>
                    {/* Guest Checkout Form (Always show for guests) */}
                    {!user && (
                      <div className="mt-6 p-6 border border-gray-300 rounded-lg bg-white text-left">
                        <h4 className="text-xl font-semibold mb-4 text-gray-800">Guest Details for Checkout</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="guest_full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" id="guest_full_name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={guestDetails.guest_full_name} onChange={handleGuestDetailsChange} required />
                          </div>
                          <div>
                            <label htmlFor="guest_email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="guest_email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={guestDetails.guest_email} onChange={handleGuestDetailsChange} required />
                          </div>
                          <div>
                            <label htmlFor="guest_phone_number" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                            <input type="tel" id="guest_phone_number" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={guestDetails.guest_phone_number} onChange={handleGuestDetailsChange} />
                          </div>
                          {/* Address fields */}
                          <div className="md:col-span-2">
                            <label htmlFor="guest_address_line1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                            <input type="text" id="guest_address_line1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={guestDetails.guest_address_line1} onChange={handleGuestDetailsChange} required />
                          </div>
                          <div className="md:col-span-2">
                            <label htmlFor="guest_address_line2" className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                            <input type="text" id="guest_address_line2" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={guestDetails.guest_address_line2} onChange={handleGuestDetailsChange} />
                          </div>
                          <div>
                            <label htmlFor="guest_city" className="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" id="guest_city" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={guestDetails.guest_city} onChange={handleGuestDetailsChange} required />
                          </div>
                          <div>
                            <label htmlFor="guest_state" className="block text-sm font-medium text-gray-700">State</label>
                            <input type="text" id="guest_state" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={guestDetails.guest_state} onChange={handleGuestDetailsChange} required />
                          </div>
                          <div>
                            <label htmlFor="guest_zip_code" className="block text-sm font-medium text-gray-700">Zip Code</label>
                            <input type="text" id="guest_zip_code" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={guestDetails.guest_zip_code} onChange={handleGuestDetailsChange} required />
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Stripe Payment Button */}
                    <button
                      onClick={handleStripeCheckout}
                      className={`mt-4 w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${!user && !isGuestDetailsValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={cart.items.length === 0 || (!user && !isGuestDetailsValid())}
                    >
                      Pay with Card
                    </button>
                    {/* Stripe Modal */}
                    {showStripeModal && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
                          <button onClick={() => setShowStripeModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">&times;</button>
                          <h3 className="text-2xl font-bold mb-4">Card Payment</h3>
                          <form onSubmit={handleStripePayment}>
                            <div id="card-element" className="mb-4 p-2 border border-gray-300 rounded"></div>
                            {paymentError && <p className="text-red-600 mb-2">{paymentError}</p>}
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700" disabled={paymentLoading}>
                              {paymentLoading ? 'Processing...' : 'Pay Now'}
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );




}

export default CartPage;

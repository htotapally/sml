import React from 'react'

function OrderConfirmationPage({ order, setCurrentPage }) {

  console.log('OrderConfirmationPage')

          return (
            <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
              <h2 className="text-3xl font-bold text-green-700 mb-4">Thank you for your order!</h2>
              <p className="text-lg mb-2">Your order <span className="font-mono">{order.merchant_order_id}</span> has been placed successfully.</p>
              <p className="mb-4">You will receive a confirmation email shortly.</p>
              <button
                className="mt-4 bg-green-600 text-white py-2 px-6 rounded font-semibold hover:bg-green-700"
                onClick={() => setCurrentPage('home')}
              >
                Continue Shopping
              </button>
            </div>
          );
}

export default OrderConfirmationPage;

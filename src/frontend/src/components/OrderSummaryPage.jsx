import React from 'react'

function OrderSummaryPage({ order, setCurrentPage }) {
  console.log('From OrderSummaryPage')
  const placedDate = order.placed_date ? new Date(order.placed_date).toLocaleString() : '';
  // const address = order.customer ? JSON.parse(order.customer) : {};
  const address = order.customer ? order.customer : {};

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
      <h2 className="text-3xl font-bold text-green-700 mb-4">Order Summary</h2>
      <p className="text-lg mb-2">Order ID: <span className="font-mono">{order.merchant_order_id}</span></p>
      <p className="mb-2">Total: <span className="font-semibold">${order.total_amount} {order.currency}</span></p>
      <p className="mb-2">Placed on: <span>{placedDate}</span></p>
      <div className="mb-4 text-left">
        <h3 className="font-semibold mb-1">Shipping Address:</h3>
        <p>{address.fullName || address.full_name}</p>
        <p>{address.address_line1}</p>
        {address.address_line2 && <p>{address.address_line2}</p>}
        <p>{address.city}, {address.state} {address.zip_code}</p>
              </div>
      <button
        className="mt-4 bg-green-600 text-white py-2 px-6 rounded font-semibold hover:bg-green-700"
        onClick={() => setCurrentPage('home')}
      >
        Continue Shopping
      </button>
    </div>
  );
}

export default OrderSummaryPage;

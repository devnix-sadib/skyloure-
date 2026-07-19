import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../store';
import { getColorHex } from '../utils/colorMap';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Account() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [defaultShipping, setDefaultShipping] = useState(120);

  useEffect(() => {
    if (user) {
      api.getOrders().then(setOrders).catch(() => {});
      api.getSettings().then(s => { if (s.shipping_fee) setDefaultShipping(parseFloat(s.shipping_fee)); }).catch(() => {});
    }
  }, [user]);

  const viewOrder = async (id) => {
    const data = await api.getOrder(id);
    setOrderDetails(data);
    setSelectedOrder(id);
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl mb-2">My Account</h2>
        <p className="text-gray-500 mb-6">Please sign in to view your account.</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-medium">
          {user.name?.charAt(0)}
        </div>
        <div>
          <h1 className="font-serif text-2xl">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl mb-6">My Orders</h2>
        {orders.length === 0 ? (
          <div className="text-center py-12 border border-gray-100 rounded-2xl">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            <p className="text-gray-500">No orders yet</p>
            <Link to="/products" className="btn-primary mt-4 inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const sf = order.shipping_fee > 0 ? order.shipping_fee : defaultShipping;
              const bag = order.shipping_fee > 0 ? order.total - order.shipping_fee : order.total;
              const orderTotal = bag + sf;
              return (
                <div key={order.id} className="border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400">ORDER #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">Bag:</span>
                        <span>৳{bag.toFixed(2)}</span>
                        <span className="text-gray-300">+</span>
                        <span className="text-gray-500">Delivery:</span>
                        <span>৳{sf.toFixed(2)}</span>
                      </div>
                      <p className="text-lg font-bold text-rose-600 mt-1">Total: ৳{orderTotal.toFixed(2)}</p>
                    </div>
                    <button onClick={() => viewOrder(order.id)} className="text-sm text-rose-600 hover:text-rose-700">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedOrder && orderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-400 mb-4">
              Order #{orderDetails.id.slice(0, 8)} · {new Date(orderDetails.created_at).toLocaleDateString()}
            </div>
            <div className="space-y-3 mb-4">
              {orderDetails.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  {item.image ? (
                    <img src={item.image} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 truncate">{item.product_name}</p>
                    {item.color && <p className="text-[11px] text-gray-400 flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border border-gray-200 inline-block" style={{ backgroundColor: getColorHex(item.color) }} />{item.color}</p>}
                    <p className="text-xs text-gray-400">×{item.quantity}</p>
                  </div>
                  <span className="font-medium flex-shrink-0">৳{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Bag Price</span>
                <span>৳{(orderDetails.shipping_fee > 0 ? orderDetails.total - orderDetails.shipping_fee : orderDetails.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery Fee</span>
                <span>৳{(orderDetails.shipping_fee > 0 ? orderDetails.shipping_fee : defaultShipping).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                <span className="font-medium text-gray-700">Total</span>
                <span className="text-xl font-bold text-rose-600">
                  ৳{((orderDetails.shipping_fee > 0 ? orderDetails.total - orderDetails.shipping_fee : orderDetails.total) + (orderDetails.shipping_fee > 0 ? orderDetails.shipping_fee : defaultShipping)).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {orderDetails.buyer_name && <p><strong>Name:</strong> {orderDetails.buyer_name}</p>}
              {orderDetails.mobile && <p><strong>Mobile:</strong> {orderDetails.mobile}</p>}
              <p><strong>Address:</strong> {orderDetails.address}</p>
              <p><strong>Phone:</strong> {orderDetails.phone}</p>
              {orderDetails.notes && <p><strong>Notes:</strong> {orderDetails.notes}</p>}
            </div>
            <span className={`mt-4 inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[orderDetails.status]}`}>
              {orderDetails.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

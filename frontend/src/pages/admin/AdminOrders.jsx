import { useState, useEffect } from 'react';
import { api } from '../../api';
import { getColorHex } from '../../utils/colorMap';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusFlow = ['pending', 'shipped', 'delivered', 'completed'];
const terminalStatuses = ['completed', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);

  const load = () => api.getOrders().then(setOrders);
  useEffect(() => { load(); }, []);

  const viewOrder = async (id) => {
    const data = await api.getOrder(id);
    setDetails(data);
    setSelected(id);
  };

  const updateStatus = async (id, status) => {
    await api.updateOrderStatus(id, status);
    setDetails(prev => prev ? { ...prev, status } : prev);
    load();
  };

  const deleteOrder = async (id, status) => {
    if (status === 'completed') return alert('Cannot delete completed orders');
    if (!confirm('Delete this order permanently?')) return;
    try {
      await api.deleteOrder(id);
      setSelected(null);
      setDetails(null);
      load();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div>
      <h2 className="font-serif text-xl mb-6">Manage Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
          <p className="text-gray-400">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-gray-200 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-xs font-medium text-rose-600">
                    #{order.id.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">{order.user_name} <span className="text-gray-400">({order.user_email})</span></p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${statusColors[order.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-rose-600 font-medium">${order.total.toFixed(2)}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => viewOrder(order.id)} className="btn-outline text-xs !py-1.5 !px-4">Details</button>
                  {order.status !== 'completed' && (
                    <button onClick={() => deleteOrder(order.id, order.status)} className="text-xs !py-1.5 !px-3 border border-red-200 text-red-500 rounded-full hover:bg-red-50 transition-all" title="Delete order">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 animate-fadeIn" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg">Order #{details.id.slice(0, 8)}</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1.5 mb-4">
              <p><strong>Customer:</strong> {details.user_name || 'N/A'}</p>
              <p><strong>Email:</strong> {details.user_email || 'N/A'}</p>
              <p><strong>Buyer Name:</strong> {details.buyer_name || 'N/A'}</p>
              <p><strong>Mobile:</strong> {details.mobile || details.phone || 'N/A'}</p>
              <p><strong>Date:</strong> {new Date(details.created_at).toLocaleDateString()}</p>
              <p><strong>Address:</strong> {details.address}</p>
              <p><strong>Phone:</strong> {details.phone}</p>
              {details.notes && <p><strong>Notes:</strong> {details.notes}</p>}
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-700">Items:</p>
              <div className="border border-gray-100 rounded-xl divide-y divide-gray-50">
                {details.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
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
                      <p className="text-sm text-gray-700 truncate">{item.product_name}</p>
                      {item.color && (
                        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full border border-gray-200 inline-block" style={{ backgroundColor: getColorHex(item.color) }} />
                          <span className="text-gray-500 font-medium">{item.color}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </div>
                    <span className="font-medium text-sm flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium px-4 py-2.5 bg-gray-50 rounded-b-xl">
                  <span>Total</span>
                  <span className="text-rose-600">${details.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

              {terminalStatuses.includes(details.status) ? (
                <div className="flex items-center justify-center py-3 bg-gray-50 rounded-xl">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize border ${statusColors[details.status]}`}>
                    {details.status}
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Update Status:</p>
                  <div className="flex flex-wrap gap-2">
                    {(statusFlow.slice(statusFlow.indexOf(details.status) + 1)).map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(details.id, s)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all bg-rose-600 text-white shadow-md shadow-rose-200 hover:bg-rose-700"
                      >
                        {s === 'completed' ? 'Complete' : s}
                      </button>
                    ))}
                    {!['completed', 'cancelled'].includes(details.status) && (
                      <button
                        onClick={() => updateStatus(details.id, 'cancelled')}
                        className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

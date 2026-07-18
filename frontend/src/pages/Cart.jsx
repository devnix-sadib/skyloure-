import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../store';
import { getColorHex, isLightColor } from '../utils/colorMap';

export default function Cart() {
  const { user, refreshCartCount } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    if (!user) return setLoading(false);
    api.getCart().then(data => { setItems(data); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <h2 className="font-serif text-2xl mb-2">Your Cart</h2>
        <p className="text-gray-500 mb-6">Please sign in to view your cart.</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  const getPrice = (item) => (item.offer_price && item.offer_price > 0 && item.offer_price < item.price ? item.offer_price : item.price);
  const total = items.reduce((sum, item) => sum + getPrice(item) * item.quantity, 0);

  const updateQty = async (cartId, qty) => {
    await api.updateCart(cartId, qty);
    setItems(prev => prev.map(i => i._cart_id === cartId ? { ...i, quantity: qty } : i).filter(i => i.quantity > 0));
    refreshCartCount();
  };

  const removeItem = async (cartId) => {
    await api.removeFromCart(cartId);
    setItems(prev => prev.filter(i => i._cart_id !== cartId));
    refreshCartCount();
  };

  const placeOrder = async () => {
    if (!buyerName || !mobile || !address) return;
    setOrdering(true);
    try {
      await api.placeOrder({ buyer_name: buyerName, mobile, address, phone: mobile, notes });
      setItems([]);
      setCheckout(false);
      refreshCartCount();
      navigate('/account');
    } catch (e) {}
    setOrdering(false);
  };

  if (loading) return <div className="text-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-rose-600 border-t-transparent mx-auto" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="font-serif text-3xl mb-8">Shopping Bag</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <p className="text-gray-500 text-lg mb-4">Your bag is empty</p>
          <Link to="/products" className="btn-primary">Shop Now</Link>
        </div>
      ) : checkout ? (
        <div className="max-w-lg mx-auto">
          <h2 className="font-serif text-xl mb-6">Checkout</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name *</label>
                <input className="input-field" placeholder="John Doe" value={buyerName} onChange={e => setBuyerName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mobile Number *</label>
                <input className="input-field" type="tel" placeholder="+1 234 567 890" value={mobile} onChange={e => setMobile(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Delivery Address *</label>
              <input className="input-field" placeholder="Street, city, zip code" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Order Notes (optional)</label>
              <textarea className="input-field" rows={3} placeholder="Any special requests..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="border-t border-gray-100 pt-4 mt-6">
              <div className="flex justify-between text-lg font-medium mb-4">
                <span>Total</span>
                <span className="text-rose-600">${total.toFixed(2)}</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCheckout(false)} className="btn-outline flex-1">Back</button>
                <button onClick={placeOrder} disabled={ordering || !buyerName || !mobile || !address} className="btn-primary flex-1 disabled:opacity-50">
                  {ordering ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item._cart_id} className="flex gap-4 p-4 border border-gray-100 rounded-2xl">
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{item.name}</h3>
                  {item.color && (
                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border border-gray-200 inline-block" style={{ backgroundColor: getColorHex(item.color) }} />
                      <span className="text-gray-600 font-medium">{item.color}</span>
                    </p>
                  )}
                  {item.offer_price && item.offer_price > 0 && item.offer_price < item.price ? (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-rose-600 font-medium">${item.offer_price.toFixed(2)}</p>
                      <p className="text-gray-400 text-xs line-through">${item.price.toFixed(2)}</p>
                    </div>
                  ) : (
                    <p className="text-rose-600 font-medium mt-1">${item.price.toFixed(2)}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-full">
                      <button onClick={() => updateQty(item._cart_id, item.quantity - 1)} className="px-3 py-1 text-gray-500 hover:text-gray-900">−</button>
                      <span className="px-3 py-1 text-sm min-w-[2rem] text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item._cart_id, item.quantity + 1)} className="px-3 py-1 text-gray-500 hover:text-gray-900">+</button>
                    </div>
                    <button onClick={() => removeItem(item._cart_id)} className="text-xs text-gray-400 hover:text-rose-600 transition-colors">Remove</button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${(getPrice(item) * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="md:col-span-1">
            <div className="border border-gray-100 rounded-2xl p-6 sticky top-24">
              <h3 className="font-serif text-lg font-medium mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-medium text-lg">
                <span>Total</span>
                <span className="text-rose-600">${total.toFixed(2)}</span>
              </div>
              <button onClick={() => setCheckout(true)} className="btn-primary w-full mt-6">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

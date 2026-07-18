import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../store';
import { getColorHex, isLightColor } from '../utils/colorMap';

export default function ProductCard({ product }) {
  const { user, refreshCartCount } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [imgIndex, setImgIndex] = useState(0);
  const colors = product.colors ? product.colors.split(',').map(c => c.trim()).filter(Boolean) : [];
  const outOfStock = !product.stock_status;
  const hasOffer = product.offer_price && product.offer_price > 0 && product.offer_price < product.price;

  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);

  useEffect(() => {
    if (user) {
      api.getFavorites().then(favs => {
        setIsFav(favs.some(f => f.id === product.id));
      }).catch(() => {});
    }
  }, [user, product.id]);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => setImgIndex(i => (i + 1) % images.length), 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  const toggleFav = async (e) => {
    e.preventDefault();
    if (!user) return window.location.href = '/login';
    setIsFav(!isFav);
    try {
      if (isFav) {
        await api.removeFavorite(product.id);
      } else {
        await api.addFavorite(product.id);
      }
    } catch {
      setIsFav(isFav);
    }
  };

  const addToCart = async (e) => {
    e.preventDefault();
    if (!user) return window.location.href = '/login';
    if (colors.length > 0 && !selectedColor) return;
    setAdding(true);
    try {
      await api.addToCart(product.id, 1, selectedColor);
      refreshCartCount();
    } catch (e) {}
    setAdding(false);
  };

  return (
    <div className="card group">
      <div className="relative overflow-hidden bg-gray-900">
        <Link to={`/products`} className="block">
          <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
            {images.length > 0 ? (
              <>
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                      i === imgIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                    } group-hover:scale-105`}
                    style={i === imgIndex ? { animation: 'kenBurns 8s ease-in-out infinite alternate' } : {}}
                  />
                ))}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.preventDefault(); setImgIndex(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      i === imgIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-gray-900 text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-lg border border-gray-700">Out of Stock</span>
          </div>
        )}
        <button onClick={toggleFav} className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-gray-900/60 backdrop-blur-sm flex items-center justify-center transition-all shadow-sm hover:scale-110 border border-white/10 z-10 ${isFav ? 'text-rose-500' : 'text-white/80 hover:text-rose-500 hover:bg-gray-900/80'}`}>
          <svg className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        {hasOffer && (
          <div className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm z-10">Sale</div>
        )}
      </div>
      <div className="p-4">
        <Link to={`/products`}>
          <h3 className="font-serif font-medium text-sm truncate text-gray-900">{product.name}</h3>
          <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{product.description}</p>
          <div className="flex items-center gap-2 mt-2">
            {hasOffer ? (
              <>
                <p className="text-rose-600 font-bold">${product.offer_price.toFixed(2)}</p>
                <p className="text-gray-400 text-xs line-through">${product.price.toFixed(2)}</p>
              </>
            ) : (
              <p className="text-rose-600 font-bold">${product.price.toFixed(2)}</p>
            )}
          </div>
        </Link>
        {colors.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Colors</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {colors.map((c, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setSelectedColor(c); }}
                  className={`w-7 h-7 rounded-full border-2 transition-all duration-150 ${
                    selectedColor === c
                      ? 'border-rose-600 scale-110 shadow-sm shadow-rose-600/30 ring-1 ring-rose-200'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: getColorHex(c) }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
        <button onClick={addToCart} disabled={adding || outOfStock || (colors.length > 0 && !selectedColor)} className={`mt-3 w-full text-sm border rounded-full py-2.5 transition-all duration-200 active:scale-[0.98] ${
          outOfStock
            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
            : colors.length > 0 && !selectedColor
              ? 'border-gray-300 text-gray-400 cursor-default bg-gray-50'
              : 'border-gray-900 bg-gray-900 text-white hover:bg-black hover:border-black'
        }`}>
          {adding ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Adding...
            </span>
          ) : outOfStock ? 'Out of Stock' : colors.length > 0 && !selectedColor ? 'Select Color' : 'Add to Bag'}
        </button>
      </div>
    </div>
  );
}

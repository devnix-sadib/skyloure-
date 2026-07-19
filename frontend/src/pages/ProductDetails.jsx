import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../store';
import { getColorHex, isLightColor } from '../utils/colorMap';
import ProductCard from '../components/ProductCard';

const CURRENCY = '৳';

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <svg key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-gray-400 font-medium">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-300">|</span>
      <span className="text-xs text-gray-400">{count || 0} reviews</span>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshCartCount } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeSection, setActiveSection] = useState('details');
  const [shippingFee, setShippingFee] = useState(120);
  const thumbnailsRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api.getSettings().then(s => { if (s.shipping_fee) setShippingFee(parseFloat(s.shipping_fee)); }).catch(() => {});
    setActiveImg(0);
    setSelectedColor('');
    setQuantity(1);
    setAddedToCart(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    api.getProduct(id).then(p => {
      setProduct(p);
      if (p.colors) {
        const colors = p.colors.split(',').map(c => c.trim()).filter(Boolean);
        if (colors.length > 0) setSelectedColor(colors[0]);
      }
      return p;
    }).then(p => {
      if (p.category_id) {
        api.getProducts(p.category_id).then(all => {
          setRelated(all.filter(r => r.id !== p.id).slice(0, 4));
        }).catch(() => {});
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user || !product) return;
    api.getFavorites().then(favs => {
      setIsFav(favs.some(f => f.id === product.id));
    }).catch(() => {});
  }, [user, product]);

  const toggleFav = async () => {
    if (!user) return navigate('/login');
    setIsFav(!isFav);
    try {
      if (isFav) await api.removeFavorite(product.id);
      else await api.addFavorite(product.id);
    } catch { setIsFav(isFav); }
  };

  const addToCart = async () => {
    if (!user) return navigate('/login');
    setAdding(true);
    try {
      await api.addToCart(product.id, quantity, selectedColor);
      refreshCartCount();
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (e) {}
    setAdding(false);
  };

  const buyNow = async () => {
    if (!user) return navigate('/login');
    setAdding(true);
    try {
      await api.addToCart(product.id, quantity, selectedColor);
      refreshCartCount();
      navigate('/cart');
    } catch (e) {}
    setAdding(false);
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-rose-600 border-t-transparent" />
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-rose-200 opacity-30" />
          </div>
          <p className="text-sm text-gray-400 animate-pulse-subtle">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-50 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl font-medium text-gray-600 mb-2">Product not found</p>
          <p className="text-sm text-gray-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="btn-primary inline-flex">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const colors = product.colors ? product.colors.split(',').map(c => c.trim()).filter(Boolean) : [];
  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const hasOffer = product.offer_price && product.offer_price > 0 && product.offer_price < product.price;
  const discount = hasOffer ? Math.round((1 - product.offer_price / product.price) * 100) : 0;
  const outOfStock = !product.stock_status;
  const canAdd = !outOfStock && (!colors.length || selectedColor);

  return (
    <div className="animate-fadeIn">
      {/* Breadcrumb */}
      <div className="bg-gray-50/70 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-400 py-3">
            <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/products" className="hover:text-rose-600 transition-colors">Products</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
          {/* Left - Image Gallery */}
          <div className="space-y-4 animate-slideUp max-w-lg mx-auto md:mx-0">
            <div className="aspect-[3/4] bg-white rounded-2xl overflow-hidden relative group shadow-lg border border-gray-100">
              {images.length > 0 ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={images[activeImg]}
                    alt={product.name}
                    className="w-full h-full object-contain transition-all duration-500"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              )}
              {hasOffer && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-rose-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-rose-600/20 flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {discount}% Off
                  </div>
                </div>
              )}
              {outOfStock && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <div className="bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-full shadow-xl border border-gray-700/50 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Out of Stock
                  </div>
                </div>
              )}
              <button
                onClick={toggleFav}
                className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg z-10 ${
                  isFav
                    ? 'bg-rose-500 text-white shadow-rose-300/50 hover:bg-rose-600'
                    : 'bg-white/90 backdrop-blur-sm text-gray-500 hover:text-rose-500 hover:bg-white border border-gray-200 hover:border-rose-200 hover:shadow-rose-200/50'
                }`}
              >
                <svg className={`w-5 h-5 transition-transform duration-300 ${isFav ? 'scale-110' : 'scale-100'}`} fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 md:hidden">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === activeImg ? 'bg-white w-6 shadow-md' : 'bg-white/60 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div ref={thumbnailsRef} className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      i === activeImg
                        ? 'border-rose-600 shadow-md shadow-rose-200/50 ring-2 ring-rose-100'
                        : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Product Details */}
          <div className="flex flex-col animate-slideUp" style={{ animationDelay: '0.1s' }}>
            {/* Brand & Title */}
            <div className="space-y-2">
              {product.brand && (
                <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-rose-200/50">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {product.brand}
                </div>
              )}
              <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-gray-900 leading-tight tracking-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="mt-4">
              <StarRating rating={4.5} count={24} />
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-5">
              {hasOffer ? (
                <>
                  <p className="text-3xl md:text-4xl font-bold text-rose-600">{CURRENCY}{product.offer_price.toFixed(2)}</p>
                  <p className="text-lg md:text-xl text-gray-400 line-through">{CURRENCY}{product.price.toFixed(2)}</p>
                  <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 shadow-sm">
                    Save {CURRENCY}{(product.price - product.offer_price).toFixed(2)}
                  </span>
                </>
              ) : (
                <p className="text-3xl md:text-4xl font-bold text-gray-900">{CURRENCY}{product.price.toFixed(2)}</p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mt-6 border-l-2 border-rose-200 pl-4 italic">
                "{product.description}"
              </p>
            )}

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-rose-200 via-gray-200 to-transparent my-7" />

            {/* Colors */}
            {colors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    Color: <span className="text-rose-600 font-semibold capitalize">{selectedColor}</span>
                  </p>
                  {selectedColor && (
                    <span
                      className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                      style={{ backgroundColor: getColorHex(selectedColor) }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {colors.map((c, i) => {
                    const hex = getColorHex(c);
                    const light = isLightColor(c);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(c)}
                        className={`relative w-11 h-11 rounded-full transition-all duration-200 ${
                          selectedColor === c
                            ? 'scale-110 shadow-lg'
                            : 'hover:scale-105 hover:shadow-md'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={c}
                      >
                        {selectedColor === c && (
                          <span className={`absolute inset-0 rounded-full border-2 ${light ? 'border-rose-600' : 'border-white'} flex items-center justify-center`}>
                            <svg className={`w-4 h-4 ${light ? 'text-rose-600' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                        {selectedColor !== c && (
                          <span className="absolute inset-0 rounded-full border border-gray-300/50 hover:border-gray-400/70" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-full overflow-hidden shadow-sm">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors active:bg-gray-100 hover:text-gray-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-14 text-center font-semibold text-gray-900 text-lg select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(99, q + 1))}
                    className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors active:bg-gray-100 hover:text-gray-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                {outOfStock && (
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-3.5 py-2 rounded-full border border-red-200 flex items-center gap-1.5 shadow-sm">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
              <button
                onClick={addToCart}
                disabled={!canAdd || adding}
                className={`flex-1 h-13 rounded-full font-medium text-sm transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2.5 shadow-sm ${
                  !canAdd
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : addedToCart
                      ? 'bg-green-600 text-white shadow-green-200 hover:bg-green-700'
                      : 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {adding ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Adding...
                  </>
                ) : addedToCart ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Bag
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={buyNow}
                disabled={!canAdd || adding}
                className={`flex-1 h-13 rounded-full font-medium text-sm transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2.5 shadow-sm ${
                  !canAdd
                    ? 'bg-gray-800/30 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:from-rose-700 hover:to-rose-600 hover:shadow-lg hover:shadow-rose-300/40 hover:-translate-y-0.5'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2.5 text-xs text-gray-500 bg-gray-50/80 rounded-xl px-3 py-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Shipping Fee</p>
                  <p className="text-gray-400">{CURRENCY}{shippingFee}.00 nationwide</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-500 bg-gray-50/80 rounded-xl px-3 py-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Secure Checkout</p>
                  <p className="text-gray-400">SSL encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-50/40 via-white to-white pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center mb-12">
              <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-rose-500 font-semibold mb-4 bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200/50">
                Complete Your Collection
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">You May Also Like</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">Discover more handpicked pieces that perfectly complement your style</p>
              <div className="flex items-center justify-center gap-2 mt-5">
                <span className="w-12 h-[2px] rounded-full bg-rose-300" />
                <span className="w-3 h-[2px] rounded-full bg-rose-600" />
                <span className="w-12 h-[2px] rounded-full bg-rose-300" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {related.map((p, i) => (
                <div
                  key={p.id}
                  className="transform transition-all duration-500 hover:-translate-y-1"
                  style={{ animation: `slideUp 0.5s ease-out ${i * 0.08}s both` }}
                >
                  <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 hover:border-rose-100/50 overflow-hidden group">
                    <ProductCard product={p} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

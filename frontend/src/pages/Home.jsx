import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [heroImg, setHeroImg] = useState(0);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getProducts().then(setProducts).catch(() => {});
  }, []);

  const heroImages = [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
  ];

  useEffect(() => {
    const t = setInterval(() => setHeroImg(i => (i + 1) % heroImages.length), 4000);
    return () => clearInterval(t);
  }, []);

  const categoryImages = {
    'Tote Bags': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    'Crossbody Bags': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    'Clutches': 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80',
    'Shoulder Bags': 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&q=80',
    'Backpacks': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
    'Wallets': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gray-50 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="animate-slideUp order-2 md:order-1">
              <span className="inline-block text-rose-600 text-sm uppercase tracking-[0.25em] font-medium bg-rose-50 px-4 py-1.5 rounded-full mb-6 border border-rose-200 shadow-sm">
                New Collection 2026
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight font-bold">
                <span className="text-rose-600">Elegance</span> in<br />Every Stitch
              </h1>
              <p className="text-gray-500 mt-5 text-base md:text-lg leading-relaxed max-w-lg">
                Discover our curated collection of handcrafted bags designed for the woman who values timeless beauty and exceptional quality.
              </p>
              <div className="flex items-center gap-4 mt-8">
                <Link to="/products" className="btn-primary text-base !px-8 !py-3 shadow-lg shadow-rose-600/20 hover:shadow-xl hover:shadow-rose-600/30">
                  Shop Now
                </Link>
                <Link to="/contact" className="btn-outline text-base !px-8 !py-3">
                  Contact Us
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Premium Quality
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Free Shipping
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Easy Returns
                </span>
              </div>
            </div>

            {/* Right: Rotating Image Gallery — fixed square */}
            <div className="order-1 md:order-2 flex items-center justify-center md:justify-end md:pr-8">
              <div className="w-[320px] h-[320px] md:w-[420px] md:h-[420px] flex-shrink-0 relative">
                <div className="w-full h-full bg-rose-50 overflow-hidden shadow-xl">
                  <img
                    key={heroImg}
                    src={heroImages[heroImg]}
                    alt="Elegant handbag"
                    className="w-full h-full object-cover animate-squareReveal"
                  />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {heroImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroImg(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === heroImg ? 'bg-rose-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="text-rose-600 text-sm uppercase tracking-[0.25em] font-medium">Collections</span>
          <h2 className="section-title mt-2">Shop by Category</h2>
          <p className="section-subtitle">Find your perfect style</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              to={`/products/${cat.id}`}
              className="group card !rounded-2xl overflow-hidden animate-slideUp"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="aspect-square overflow-hidden bg-gray-100 relative">
                <img
                  src={cat.image || categoryImages[cat.name] || `https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80`}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-serif text-sm md:text-base font-medium text-center drop-shadow-lg">{cat.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-rose-600 text-sm uppercase tracking-[0.25em] font-medium">Featured</span>
            <h2 className="section-title mt-2">Featured Bags</h2>
            <p className="section-subtitle">Most loved designs</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((p, i) => (
              <div key={p.id} className="animate-slideUp" style={{ animationDelay: `${i * 80}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          {products.length > 8 && (
            <div className="text-center mt-12">
              <Link to="/products" className="btn-dark text-lg !px-10 !py-3">View All Bags</Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <span className="text-rose-600 text-sm uppercase tracking-[0.25em] font-medium">Why Choose Us</span>
          <h2 className="section-title mt-2">The Skyloure Experience</h2>
          <p className="section-subtitle">Crafted with care, delivered with love</p>
        </div>
        <div className="flex justify-center">
          <div className="text-center p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 group max-w-md">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 shadow-sm">
              <svg className="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-medium mb-3">Premium Quality</h3>
            <p className="text-gray-500 leading-relaxed">Handcrafted with the finest materials for lasting elegance and timeless beauty.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

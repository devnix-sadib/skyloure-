import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const { categoryId } = useParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState(categoryId || '');

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setActiveCat(categoryId || '');
  }, [categoryId]);

  useEffect(() => {
    api.getProducts(activeCat || undefined).then(setProducts).catch(() => {});
  }, [activeCat]);

  const activeCategory = categories.find(c => c.id === activeCat);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center mb-10">
        <h1 className="section-title">{activeCategory ? activeCategory.name : 'Our Collection'}</h1>
        <p className="section-subtitle">{activeCategory ? 'Browse our selection' : 'Timeless elegance, crafted for you'}</p>
      </div>

      {/* Category filter with images */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <button
          onClick={() => setActiveCat('')}
          className={`group flex flex-col items-center gap-1.5 px-1 py-1 transition-all ${!activeCat ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
        >
          <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${!activeCat ? 'border-rose-600 shadow-md shadow-rose-200' : 'border-transparent hover:border-gray-200'}`}>
            <div className="w-full h-full bg-rose-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
            </div>
          </div>
          <span className={`text-[11px] font-medium uppercase tracking-wider ${!activeCat ? 'text-rose-600' : 'text-gray-500'}`}>All</span>
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`group flex flex-col items-center gap-1.5 px-1 py-1 transition-all ${activeCat === cat.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
          >
            <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${activeCat === cat.id ? 'border-rose-600 shadow-md shadow-rose-200' : 'border-transparent hover:border-gray-200'}`}>
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                  </svg>
                </div>
              )}
            </div>
            <span className={`text-[11px] font-medium uppercase tracking-wider ${activeCat === cat.id ? 'text-rose-600' : 'text-gray-500'}`}>{cat.name}</span>
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Try selecting a different category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <div key={p.id} className="animate-slideUp" style={{ animationDelay: `${i * 80}ms` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

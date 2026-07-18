import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, pending: 0, products: 0, categories: 0, revenue: 0 });

  useEffect(() => {
    Promise.all([
      api.getOrders().catch(() => []),
      api.getProducts().catch(() => []),
      api.getCategories().catch(() => []),
    ]).then(([orders, products, categories]) => {
      setStats({
        orders: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        products: products.length,
        categories: categories.length,
        revenue: orders.filter(o => o.status === 'delivered' || o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0),
      });
    });
  }, []);

  const cards = [
    { label: 'Total Orders', value: stats.orders, color: 'rose', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z' },
    { label: 'Pending Orders', value: stats.pending, color: 'amber', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Products', value: stats.products, color: 'blue', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Categories', value: stats.categories, color: 'green', icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z' },
    { label: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, color: 'purple', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  const colorMap = {
    rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  };

  return (
    <div>
      <h2 className="font-serif text-xl mb-6">Dashboard Overview</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card, i) => {
          const c = colorMap[card.color];
          return (
            <div key={i} className="card p-6 hover:shadow-xl transition-all duration-300 group">
              <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <svg className={`w-6 h-6 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                </svg>
              </div>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Footer() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    api.getContact().then(setInfo).catch(() => {});
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <img src="/logo.png" alt="Skyloure" className="h-9 w-9 rounded-full ring-2 ring-rose-400 shadow-sm" />
                <div className="absolute -inset-1 rounded-full bg-rose-500/20 blur" />
              </div>
              <span className="font-serif text-xl font-bold text-white">Skyloure</span>
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Elegant handcrafted bags for the modern woman. Timeless designs, exceptional quality.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-white text-lg font-medium mb-5">Quick Links</h4>
            <div className="space-y-3 text-sm">
              <Link to="/" className="block text-gray-400 hover:text-rose-400 transition-colors">Home</Link>
              <Link to="/products" className="block text-gray-400 hover:text-rose-400 transition-colors">All Bags</Link>
              <Link to="/contact" className="block text-gray-400 hover:text-rose-400 transition-colors">Contact Us</Link>
              <Link to="/cart" className="block text-gray-400 hover:text-rose-400 transition-colors">Shopping Cart</Link>
              <Link to="/favorites" className="block text-gray-400 hover:text-rose-400 transition-colors">Favorites</Link>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-white text-lg font-medium mb-5">Contact</h4>
            <div className="space-y-3 text-sm text-gray-400">
              {info?.email && <p className="flex items-center gap-2"><svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{info.email}</p>}
              {info?.phone && <p className="flex items-center gap-2"><svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{info.phone}</p>}
              {info?.address && <p className="flex items-start gap-2"><svg className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{info.address}</p>}
            </div>
          </div>

          <div>
            <h4 className="font-serif text-white text-lg font-medium mb-5">Follow Us</h4>
            <div className="space-y-3 text-sm">
              {(info?.instagram || info?.facebook || info?.whatsapp) ? (
                <>
                  {info.instagram && <a href={info.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-rose-400 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={2}/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" strokeWidth={2}/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth={2}/></svg>Instagram</a>}
                  {info.facebook && <a href={info.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-rose-400 transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>Facebook</a>}
                  {info.whatsapp && <a href={`https://wa.me/${info.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-rose-400 transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" /></svg>WhatsApp</a>}
                </>
              ) : (
                <>
                  <p className="text-gray-500">Instagram</p>
                  <p className="text-gray-500">Facebook</p>
                  <p className="text-gray-500">Pinterest</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Skyloure. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/products" className="hover:text-gray-300 transition-colors">Shop</Link>
            <Link to="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

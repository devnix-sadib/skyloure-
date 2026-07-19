import { useState, useEffect } from 'react';
import { api } from '../../api';
import { getColorHex } from '../../utils/colorMap';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ category_id: '', name: '', description: '', price: '', offer_price: '', image: '', stock_status: 1, colors: '', brand: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const load = () => { api.getProducts().then(setProducts); api.getCategories().then(setCategories); };
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ category_id: categories[0]?.id || '', name: '', description: '', price: '', offer_price: '', image: '', stock_status: 1, colors: '', brand: '' });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeNewImage = (i) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const removeExistingImage = (url) => {
    setExistingImages(prev => prev.filter(u => u !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category_id) return;
    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of imageFiles) {
        const result = await api.uploadImage(file);
        uploadedUrls.push(result.url);
      }
      const allImages = [...existingImages, ...uploadedUrls];
      const data = {
        ...form,
        price: parseFloat(form.price),
        offer_price: form.offer_price ? parseFloat(form.offer_price) : null,
        stock_status: form.stock_status,
        colors: form.colors || '',
        brand: form.brand || '',
        image: allImages[0] || form.image || null,
        images: allImages,
      };
      if (editing) {
        await api.updateProduct(editing, data);
      } else {
        await api.createProduct(data);
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      load();
    } catch (err) {
      alert(err.message);
    }
    setUploading(false);
  };

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({
      category_id: p.category_id,
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      offer_price: p.offer_price ? String(p.offer_price) : '',
      stock_status: p.stock_status,
      colors: p.colors || '',
      brand: p.brand || '',
      image: p.image || '',
    });
    setExistingImages(p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []));
    setImageFiles([]);
    setImagePreviews([]);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.deleteProduct(id);
      load();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl">Manage Products</h2>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); resetForm(); }} className={`${showForm ? 'btn-outline' : 'btn-primary'} text-sm !py-2 !px-4`}>
          {showForm ? (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </span>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4 mb-8 p-6 border border-gray-100 rounded-2xl bg-gray-50 shadow-sm animate-slideDown">
          <div className="sm:col-span-2">
            <h3 className="font-medium text-gray-700 mb-4">{editing ? 'Edit Product' : 'Add New Product'}</h3>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600 mb-1.5 font-medium">Category</label>
            <select className="input-field" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5 font-medium">Name *</label>
            <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5 font-medium">
              Price *
              <span className="text-gray-400 font-normal ml-1">(original/regular price)</span>
            </label>
            <input className="input-field" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5 font-medium">
              Offer Price
              <span className="text-gray-400 font-normal ml-1">(discounted/sale price)</span>
            </label>
            <input className="input-field" type="number" step="0.01" min="0" value={form.offer_price} onChange={e => setForm({ ...form, offer_price: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5 font-medium">Stock Status</label>
            <button
              type="button"
              onClick={() => setForm({ ...form, stock_status: form.stock_status ? 0 : 1 })}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                form.stock_status
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : 'border-red-300 bg-red-50 text-red-600'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${form.stock_status ? 'bg-green-500' : 'bg-red-500'}`} />
              {form.stock_status ? 'In Stock' : 'Out of Stock'}
            </button>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5 font-medium">
              Available Colors
              <span className="text-gray-400 font-normal ml-1">(comma separated)</span>
            </label>
            <input className="input-field" value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} placeholder="Black,Brown,Navy,Red" />
          </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5 font-medium">Brand</label>
              <input className="input-field" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Gucci, Prada, Nike" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-600 mb-1.5 font-medium">Description</label>
              <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600 mb-1.5 font-medium">Product Images</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {existingImages.map((url, i) => (
                <div key={`e-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-200 shadow-sm group/image">
                  <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(url)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {imagePreviews.map((url, i) => (
                <div key={`n-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-rose-200 shadow-sm group/image">
                  <img src={url} alt={`New ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewImage(i)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/30 transition-all">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
              </label>
            </div>
          </div>
          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={uploading} className="btn-primary disabled:opacity-50">
              {uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </span>
              ) : editing ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => {
          const cat = categories.find(c => c.id === p.category_id);
          const hasOffer = p.offer_price && p.offer_price > 0 && p.offer_price < p.price;
          const images = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
          return (
            <div key={p.id} className="card !rounded-xl overflow-hidden group">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                {images.length > 0 ? (
                  <div className="w-full h-full">
                    <img src={images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                        +{images.length - 1}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-rose-50 text-gray-300">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                    </svg>
                  </div>
                )}
                {hasOffer && (
                  <div className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Sale
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => startEdit(p)} className="w-9 h-9 rounded-full bg-white text-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-md" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="w-9 h-9 rounded-full bg-white text-red-500 flex items-center justify-center hover:scale-110 transition-transform shadow-md" title="Delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.stock_status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {p.stock_status ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{cat?.name}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {hasOffer ? (
                    <>
                      <p className="text-rose-600 font-medium">৳{p.offer_price.toFixed(2)}</p>
                      <p className="text-gray-400 text-xs line-through">৳{p.price.toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="text-rose-600 font-medium">৳{p.price.toFixed(2)}</p>
                  )}
                </div>
                {p.colors && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {p.colors.split(',').filter(Boolean).map((c, i) => (
                      <span key={i} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: getColorHex(c.trim()) }} title={c.trim()} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <div className="text-gray-400 text-sm py-12 text-center col-span-full border-2 border-dashed border-gray-200 rounded-2xl">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p>No products yet.</p>
            <p className="text-xs mt-1">Click "Add Product" to create one</p>
          </div>
        )}
      </div>
    </div>
  );
}

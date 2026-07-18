import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => api.getCategories().then(setCategories);
  useEffect(() => { load(); }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setUploading(true);
    try {
      let imageUrl = imagePreview && !image ? imagePreview : '';
      if (image) {
        const result = await api.uploadImage(image);
        imageUrl = result.url;
      }
      if (editing) {
        await api.updateCategory(editing, { name, image: imageUrl || null });
      } else {
        await api.createCategory({ name, image: imageUrl || null });
      }
      setName('');
      setImage(null);
      setImagePreview('');
      setEditing(null);
      load();
    } catch (err) {
      alert(err.message);
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category and all its products?')) return;
    try {
      await api.deleteCategory(id);
      load();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const startEdit = (cat) => {
    setEditing(cat.id);
    setName(cat.name);
    setImagePreview(cat.image || '');
    setImage(null);
  };

  return (
    <div>
      <h2 className="font-serif text-xl mb-6">Manage Categories</h2>

      <form onSubmit={handleSubmit} className="mb-8 p-6 border border-gray-100 rounded-2xl bg-gray-50 max-w-lg shadow-sm">
        <h3 className="font-medium text-gray-700 mb-4">{editing ? 'Edit Category' : 'Add New Category'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1.5 font-medium">Category Name</label>
            <input className="input-field" placeholder="e.g. Tote Bags" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1.5 font-medium">Category Image</label>
            <div className="flex items-start gap-4">
              <input type="file" accept="image/*" onChange={handleImageSelect} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100" />
              {imagePreview && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-rose-200 flex-shrink-0 shadow-sm">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setImagePreview(''); setImage(null); }} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 shadow-sm">×</button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={uploading} className="btn-primary !rounded-full !px-5 disabled:opacity-50">
              {uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </span>
              ) : editing ? 'Update Category' : 'Add Category'}
            </button>
            {editing && <button type="button" onClick={() => { setEditing(null); setName(''); setImagePreview(''); setImage(null); }} className="btn-outline !rounded-full !px-5">Cancel</button>}
          </div>
        </div>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="card !rounded-xl overflow-hidden group">
            <div className="aspect-square bg-gray-100 overflow-hidden relative">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-rose-50 text-gray-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => startEdit(cat)} className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center text-sm hover:scale-110 transition-transform shadow-md" title="Edit">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(cat.id)} className="w-8 h-8 rounded-full bg-white text-red-500 flex items-center justify-center text-sm hover:scale-110 transition-transform shadow-md" title="Delete">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-3 text-center">
              <p className="font-medium text-sm truncate">{cat.name}</p>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-gray-400 text-sm py-12 text-center col-span-full border-2 border-dashed border-gray-200 rounded-2xl">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            </svg>
            <p>No categories yet.</p>
            <p className="text-xs mt-1">Add one above</p>
          </div>
        )}
      </div>
    </div>
  );
}

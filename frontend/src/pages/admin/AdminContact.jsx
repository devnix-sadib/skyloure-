import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function AdminContact() {
  const [form, setForm] = useState({ email: '', phone: '', address: '', instagram: '', facebook: '', whatsapp: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getContact().then(info => {
      if (info) setForm({
        email: info.email || '',
        phone: info.phone || '',
        address: info.address || '',
        instagram: info.instagram || '',
        facebook: info.facebook || '',
        whatsapp: info.whatsapp || '',
      });
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.updateContact(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields = [
    { key: 'email', label: 'Email', type: 'email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { key: 'phone', label: 'Phone', type: 'text', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
    { key: 'address', label: 'Address', type: 'text', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { key: 'instagram', label: 'Instagram URL', type: 'text', icon: 'M16 8a6 6 0 016 6v6a6 6 0 01-6 6H8a6 6 0 01-6-6v-6a6 6 0 016-6h8z' },
    { key: 'facebook', label: 'Facebook URL', type: 'text', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
    { key: 'whatsapp', label: 'WhatsApp Number', type: 'text', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347' },
  ];

  return (
    <div>
      <h2 className="font-serif text-xl mb-6">Contact Information</h2>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-sm text-gray-600 mb-1.5 font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
              </svg>
              {f.label}
            </label>
            <input className="input-field" type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
          </div>
        ))}
        <button type="submit" className={`btn-primary transition-all ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}>
          {saved ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </span>
          ) : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Contact() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    api.getContact().then(setInfo).catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center mb-12 animate-slideUp">
        <span className="text-rose-600 text-sm uppercase tracking-[0.25em] font-medium">Get in Touch</span>
        <h1 className="section-title mt-2">Contact Us</h1>
        <p className="section-subtitle">We'd love to hear from you</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6 animate-slideUp">
          <h2 className="font-serif text-xl">Contact Information</h2>
          {info && (
            <div className="space-y-5">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-rose-50 border border-rose-100">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Email</p>
                  <p className="text-gray-500 text-sm">{info.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-rose-50 border border-rose-100">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Phone</p>
                  <p className="text-gray-500 text-sm">{info.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-rose-50 border border-rose-100">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Address</p>
                  <p className="text-gray-500 text-sm">{info.address}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm animate-slideUp">
          <h2 className="font-serif text-xl mb-4">Send a Message</h2>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert('Message sent! We\'ll get back to you soon.'); }}>
            <input className="input-field" placeholder="Your Name" required />
            <input className="input-field" type="email" placeholder="Your Email" required />
            <textarea className="input-field" rows={4} placeholder="Your Message" required />
            <button type="submit" className="btn-primary w-full">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}

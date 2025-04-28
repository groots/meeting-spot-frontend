'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Form validation
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid email address'
      });
      return;
    }

    setStatus({ type: 'pending', message: 'Sending your message...' });

    // In a real application, you would send the form data to a backend API
    // Simulating API call with setTimeout
    setTimeout(() => {
      // Success simulation
      setStatus({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="prose max-w-none">
            <p>
              We'd love to hear from you! Please fill out the form with your information and we'll get back to you as soon as possible.
            </p>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Our Information</h3>

              <div className="space-y-3">
                <p className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-8.486 8.486l4.243 4.243 4.243-4.243a6 6 0 000-8.486zm-1.414 7.071l-3.829 3.829-3.829-3.829a4 4 0 115.657-5.657 4 4 0 010 5.657z" clipRule="evenodd" />
                  </svg>
                  <span>123 Main Street, Suite 100<br />Anytown, ST 12345</span>
                </p>

                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>(123) 456-7890</span>
                </p>

                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>contact@findameetingspot.com</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            {status.message && (
              <div
                className={`mb-4 p-3 rounded ${
                  status.type === 'error' ? 'bg-red-100 text-red-700' :
                  status.type === 'success' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}
              >
                {status.message}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={status.type === 'pending'}
            >
              {status.type === 'pending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

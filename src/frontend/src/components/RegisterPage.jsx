import React, { useContext, useState } from 'react'

import { ThemeContext } from './ThemeContext'

function RegisterPage({ setCurrentPage }) {


          const { handleLogin, API_BASE_URL } = useContext(ThemeContext);
          const [formData, setFormData] = useState({
            email: '',
            password: '',
            full_name: '',
            phone_number: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            zip_code: ''
          });
          const [loading, setLoading] = useState(false);
          const [error, setError] = useState(null);

          const handleChange = (e) => {
            setFormData({ ...formData, [e.target.id]: e.target.value });
          };

          const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);

            try {
              const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
              });
              const data = await response.json();

              if (response.ok) {
                handleLogin(data.user, data.token);
              } else {
                throw new Error(data.message || 'Registration failed');
              }
            } catch (err) {
              console.error('Registration error:', err);
              setError(err.message);
            } finally {
              setLoading(false);
            }
          };

          return (
            <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Register Account</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" id="full_name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.full_name} onChange={handleChange} required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" id="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input type="password" id="password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.password} onChange={handleChange} required />
                </div>
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="tel" id="phone_number" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.phone_number} onChange={handleChange} />
                </div>
                <div>
                  <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                  <input type="text" id="address_line1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.address_line1} onChange={handleChange} required />
                </div>
                <div>
                  <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                  <input type="text" id="address_line2" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.address_line2} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <input type="text" id="city" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.city} onChange={handleChange} required />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                    <input type="text" id="state" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.state} onChange={handleChange} required />
                  </div>
                  <div>
                    <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">Zip Code</label>
                    <input type="text" id="zip_code" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value={formData.zip_code} onChange={handleChange} required />
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button onClick={() => setCurrentPage('login')} className="font-medium text-green-600 hover:text-green-500">
                  Sign In here
                </button>
              </p>
            </div>
          );





}

export default RegisterPage;

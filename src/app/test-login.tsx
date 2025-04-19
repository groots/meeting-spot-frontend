'use client';

import { useState } from 'react';
import { API_ENDPOINTS } from './config';

export default function TestLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Test the debug login endpoint
      console.log('Testing debug login with:', { email });
      const response = await fetch(`${API_ENDPOINTS.login.replace('/api/v1/auth/login', '/debug/debug-login')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log('Debug login response:', data);
      setResult(data);
      
      // Test the regular login endpoint
      console.log('Testing regular login with:', { email });
      const regularResponse = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      try {
        const regularData = await regularResponse.json();
        console.log('Regular login response:', regularData);
        setResult(prev => ({ 
          ...prev, 
          regular_login: {
            status: regularResponse.status,
            ok: regularResponse.ok,
            data: regularData
          }
        }));
      } catch (err) {
        console.error('Error parsing regular login response:', err);
        setResult(prev => ({ 
          ...prev, 
          regular_login: {
            status: regularResponse.status,
            ok: regularResponse.ok,
            error: 'Failed to parse response',
            text: await regularResponse.text()
          }
        }));
      }
    } catch (err) {
      console.error('Error testing login:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login Debugger</h1>
      
      <form onSubmit={handleTestLogin} className="space-y-4 mb-6">
        <div>
          <label className="block mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Login'}
        </button>
      </form>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Debug Results</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 
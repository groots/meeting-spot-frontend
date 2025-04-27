'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getContacts } from '@/app/api/contacts';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/app/config';

export default function DebugPage() {
  const { token, user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<string>('');

  const handleFetchContacts = async () => {
    if (!token) {
      setError('No authentication token found');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching contacts...');
      const data = await getContacts(token);
      console.log('Contacts response:', data);
      
      if (Array.isArray(data)) {
        setContacts(data);
        setApiResponse(JSON.stringify(data, null, 2));
      } else {
        console.error('Response is not an array:', data);
        setContacts([]);
        setApiResponse(JSON.stringify(data, null, 2));
        setError('Response is not in expected format');
      }
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      setError(err.message || 'Failed to fetch contacts');
      setApiResponse(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectFetch = async () => {
    if (!token) {
      setError('No authentication token found');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Direct fetch to contacts API...');
      const url = API_ENDPOINTS.contacts;
      console.log('URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const contentType = response.headers.get('content-type');
      console.log('Response status:', response.status);
      console.log('Content-Type:', contentType);
      
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = await response.text();
      }
      
      console.log('Direct API response:', result);
      setApiResponse(JSON.stringify(result, null, 2));
      
      if (Array.isArray(result)) {
        setContacts(result);
      } else {
        setContacts([]);
        setError('Response is not in expected format');
      }
    } catch (err: any) {
      console.error('Error with direct fetch:', err);
      setError(err.message || 'Failed to fetch contacts directly');
      setApiResponse(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">API Debug Page</h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-700 mb-2">
          User status: {user ? `Logged in as ${user.email}` : 'Not logged in'}
        </p>
        <p className="text-sm text-gray-700 mb-4">
          Token: {token ? `${token.substring(0, 10)}...` : 'No token'}
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={handleFetchContacts} 
            disabled={loading || !token}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Loading...' : 'Test Contacts API (helper)'}
          </Button>
          
          <Button 
            onClick={handleDirectFetch} 
            disabled={loading || !token}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Loading...' : 'Test Direct API Call'}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Contacts List ({contacts.length})</h2>
          {contacts.length > 0 ? (
            <ul className="border rounded-md divide-y">
              {contacts.map((contact) => (
                <li key={contact.id} className="p-3">
                  <p className="font-medium">{contact.name || 'Unnamed Contact'}</p>
                  {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
                  {contact.phone && <p className="text-sm text-gray-600">{contact.phone}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No contacts found</p>
          )}
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Raw API Response</h2>
          <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto max-h-96">
            {apiResponse || 'No response yet'}
          </pre>
        </div>
      </div>
    </div>
  );
} 
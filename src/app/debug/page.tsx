'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/app/config';
import TestLogin from '../test-login';

interface DbStatus {
  status: string;
  message: string;
  db_version?: string;
  database_url?: string;
  flask_env?: string;
  debug_mode?: boolean;
  encryption_key_set?: boolean;
  google_maps_api_key_set?: boolean;
  error?: string;
}

export default function DebugPage() {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Get the API base URL from the config
    const url = API_ENDPOINTS.meetingRequests;
    setApiBaseUrl(url);
  }, []);
  
  const checkDatabaseConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.dbCheck);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setDbStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error checking database:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Debug Tools</h1>
      <TestLogin />
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'Not set'}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">API Endpoints</h2>
        <p><strong>Meeting Requests Endpoint:</strong> {apiBaseUrl}</p>
        <p><strong>DB Check Endpoint:</strong> {API_ENDPOINTS.dbCheck}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">Database Connectivity</h2>
        <button 
          onClick={checkDatabaseConnection}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:bg-gray-400"
        >
          {loading ? 'Checking...' : 'Check Database Connection'}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
        
        {dbStatus && (
          <div className="mt-4">
            <p><strong>Status:</strong> 
              <span className={dbStatus.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                {dbStatus.status}
              </span>
            </p>
            <p><strong>Message:</strong> {dbStatus.message}</p>
            {dbStatus.db_version && <p><strong>DB Version:</strong> {dbStatus.db_version}</p>}
            {dbStatus.database_url && <p><strong>Database URL:</strong> {dbStatus.database_url}</p>}
            {dbStatus.flask_env && <p><strong>Flask Environment:</strong> {dbStatus.flask_env}</p>}
            <p><strong>Debug Mode:</strong> {dbStatus.debug_mode ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Encryption Key Set:</strong> {dbStatus.encryption_key_set ? 'Yes' : 'No'}</p>
            <p><strong>Google Maps API Key Set:</strong> {dbStatus.google_maps_api_key_set ? 'Yes' : 'No'}</p>
            {dbStatus.error && <p><strong>Error Details:</strong> {dbStatus.error}</p>}
          </div>
        )}
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Build Information</h2>
        <p><strong>Build Time:</strong> {new Date().toISOString()}</p>
      </div>
    </div>
  );
} 
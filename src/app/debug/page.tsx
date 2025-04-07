'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/app/config';

export default function DebugPage() {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  
  useEffect(() => {
    // Get the API base URL from the config
    const url = API_ENDPOINTS.meetingRequests;
    setApiBaseUrl(url);
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Configuration Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'Not set'}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">API Endpoints</h2>
        <p><strong>Meeting Requests Endpoint:</strong> {apiBaseUrl}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Build Information</h2>
        <p><strong>Build Time:</strong> {new Date().toISOString()}</p>
      </div>
    </div>
  );
} 
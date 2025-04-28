'use client';

import React, { useState } from 'react';
import { API_ENDPOINTS } from '../config';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test the health endpoint
      const response = await fetch('https://meeting-spot-backend-zylogyedtq-ue.a.run.app/api/v2/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult({
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
      <p className="mb-4">This page tests the connection between the frontend and backend API.</p>

      <div className="mb-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold">Connection Failed</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold">Connection Successful!</h3>
          <p>Status: {result.status} {result.statusText}</p>
          <p className="mt-2">Response:</p>
          <pre className="bg-white p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

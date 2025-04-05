'use client';

import { useEffect, useState } from 'react';

interface RequestStatusProps {
  status: string;
}

export default function RequestStatus({ status }: RequestStatusProps) {
  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Request Status
      </h2>
      <div className="text-lg text-gray-700 dark:text-gray-300">
        {status === 'pending_b_address' && (
          <p>Waiting for the other person to submit their address...</p>
        )}
        {status === 'calculating' && (
          <div>
            <p>Calculating meeting spots...</p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </div>
        )}
        {status === 'completed' && (
          <p>Meeting spots have been found!</p>
        )}
      </div>
    </div>
  );
} 
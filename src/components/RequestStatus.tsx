'use client';

import { useEffect, useState } from 'react';

interface RequestStatusProps {
  status: string;
}

export default function RequestStatus({ status }: RequestStatusProps) {
  return (
    <div className="max-w-md mx-auto p-6 bg-card text-card-foreground rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">
        Request Status
      </h2>
      <div className="text-lg">
        {status === 'pending_b_address' && (
          <p className="text-muted-foreground">Waiting for the other person to submit their address...</p>
        )}
        {status === 'calculating' && (
          <div>
            <p className="text-muted-foreground">Calculating meeting spots...</p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        )}
        {status === 'completed' && (
          <p className="text-muted-foreground">Meeting spots have been found!</p>
        )}
      </div>
    </div>
  );
}

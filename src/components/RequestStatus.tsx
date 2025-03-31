import { useEffect, useState } from 'react';

interface RequestStatusProps {
  requestId: string;
}

type RequestStatus = 'pending_b_address' | 'calculating' | 'completed' | 'expired';

interface StatusDetails {
  status: RequestStatus;
  expires_at: string;
  message: string;
}

export default function RequestStatus({ requestId }: RequestStatusProps) {
  const [statusDetails, setStatusDetails] = useState<StatusDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/v1/requests/${requestId}/status`);
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        const data = await response.json();
        setStatusDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [requestId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!statusDetails) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-600 dark:text-gray-400">Status not available.</p>
      </div>
    );
  }

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'pending_b_address':
        return 'bg-yellow-500';
      case 'calculating':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: RequestStatus) => {
    switch (status) {
      case 'pending_b_address':
        return 'Waiting for other person to respond';
      case 'calculating':
        return 'Finding the perfect meeting spot';
      case 'completed':
        return 'Meeting spot found!';
      case 'expired':
        return 'Request expired';
      default:
        return 'Unknown status';
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(statusDetails.status)}`} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getStatusText(statusDetails.status)}
          </h2>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {statusDetails.message}
        </p>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Expires: {new Date(statusDetails.expires_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
} 
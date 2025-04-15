'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserSubscriptions, 
  createSubscription, 
  cancelSubscription, 
  createCheckoutSession,
  Subscription 
} from '../api/subscriptions';

// Map plans to Stripe price IDs
const STRIPE_PRICE_IDS: Record<string, string> = {
  basic: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || 'price_1Pv2FpCVP5VPWd1qXYAszP7k',
  premium: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_1Pv2GfCVP5VPWd1qQ5QIivyi'
};

const SubscriptionPage = () => {
  const { token, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check URL params for success/cancel from Stripe redirect
  useEffect(() => {
    if (!searchParams) return;
    
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      setSuccessMessage('Payment successful! Your subscription is now active.');
      // Refresh subscriptions to show the new one
      if (token) {
        getUserSubscriptions(token).then(data => {
          setSubscriptions(data);
          const active = data.find(sub => sub.status === 'active');
          setActiveSubscription(active || null);
        });
      }
    } else if (canceled === 'true') {
      setError('Payment was canceled. Your subscription has not been activated.');
    }
  }, [searchParams, token]);

  // Check if user is authenticated, redirect to login if not
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Load user subscriptions
  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const data = await getUserSubscriptions(token);
        setSubscriptions(data);
        
        // Find active subscription if any
        const active = data.find(sub => sub.status === 'active');
        setActiveSubscription(active || null);
      } catch (err) {
        console.error('Error loading subscriptions:', err);
        setError('Failed to load subscription data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, [token]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (selectedPlan === 'free') {
        // For free plan, just create the subscription directly
        const newSubscription = await createSubscription(
          {
            plan_id: 'free',
            payment_provider: 'none'
          }, 
          token
        );
        
        // Add the new subscription to our list and set it as active
        setSubscriptions([...subscriptions, newSubscription]);
        setActiveSubscription(newSubscription);
        setSuccessMessage('You are now on the Free plan.');
      } else {
        // For paid plans, create a checkout session and redirect to Stripe
        const priceId = STRIPE_PRICE_IDS[selectedPlan];
        if (!priceId) {
          throw new Error(`No price ID found for plan: ${selectedPlan}`);
        }
        
        // Create a checkout session
        const { checkout_url } = await createCheckoutSession(
          {
            price_id: priceId,
            success_url: `${window.location.origin}/subscription?success=true`,
            cancel_url: `${window.location.origin}/subscription?canceled=true`
          },
          token
        );
        
        // Redirect to Stripe checkout
        window.location.href = checkout_url;
      }
    } catch (err) {
      console.error('Error with subscription flow:', err);
      setError('Failed to process subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!activeSubscription || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updated = await cancelSubscription(activeSubscription.id, token);
      
      // Update the subscription in our list
      setSubscriptions(
        subscriptions.map(sub => 
          sub.id === updated.id ? updated : sub
        )
      );
      
      // If successfully marked for cancellation, update the active subscription
      if (updated.cancel_at_period_end) {
        setActiveSubscription(updated);
        setSuccessMessage('Your subscription has been canceled and will end at the current billing period.');
      }
      
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate when the current subscription ends, if any
  const subscriptionEndsAt = activeSubscription?.current_period_end
    ? new Date(activeSubscription.current_period_end).toLocaleDateString()
    : null;

  if (loading && subscriptions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {/* Current Subscription Status */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
        
        {activeSubscription ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600">Plan</p>
                <p className="font-medium">{activeSubscription.plan_id.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium capitalize">{activeSubscription.status}</p>
              </div>
              <div>
                <p className="text-gray-600">Started On</p>
                <p className="font-medium">
                  {new Date(activeSubscription.current_period_start).toLocaleDateString()}
                </p>
              </div>
              {subscriptionEndsAt && (
                <div>
                  <p className="text-gray-600">
                    {activeSubscription.cancel_at_period_end ? 'Ends On' : 'Renews On'}
                  </p>
                  <p className="font-medium">{subscriptionEndsAt}</p>
                </div>
              )}
            </div>
            
            {activeSubscription.status === 'active' && !activeSubscription.cancel_at_period_end && (
              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Cancel Subscription'}
              </button>
            )}
            
            {activeSubscription.cancel_at_period_end && (
              <div className="mt-4 p-4 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-yellow-800">
                  Your subscription has been canceled and will end on {subscriptionEndsAt}.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p>You don't have an active subscription.</p>
        )}
      </div>

      {/* Subscription Plans */}
      {(!activeSubscription || activeSubscription.cancel_at_period_end) && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Choose a Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Free Plan */}
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPlan === 'free' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleSelectPlan('free')}
            >
              <h3 className="text-lg font-medium mb-2">Free</h3>
              <p className="text-2xl font-bold mb-4">$0<span className="text-sm font-normal text-gray-500">/month</span></p>
              <ul className="text-sm space-y-2 mb-4">
                <li>✓ Basic features</li>
                <li>✓ 10 meeting requests/month</li>
                <li>✓ Basic location search</li>
              </ul>
            </div>
            
            {/* Basic Plan */}
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPlan === 'basic' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleSelectPlan('basic')}
            >
              <h3 className="text-lg font-medium mb-2">Basic</h3>
              <p className="text-2xl font-bold mb-4">$9.99<span className="text-sm font-normal text-gray-500">/month</span></p>
              <ul className="text-sm space-y-2 mb-4">
                <li>✓ All free features</li>
                <li>✓ Unlimited meeting requests</li>
                <li>✓ Advanced location filtering</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
            
            {/* Premium Plan */}
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPlan === 'premium' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleSelectPlan('premium')}
            >
              <h3 className="text-lg font-medium mb-2">Premium</h3>
              <p className="text-2xl font-bold mb-4">$19.99<span className="text-sm font-normal text-gray-500">/month</span></p>
              <ul className="text-sm space-y-2 mb-4">
                <li>✓ All basic features</li>
                <li>✓ Team collaboration</li>
                <li>✓ Analytics and reporting</li>
                <li>✓ Premium support</li>
                <li>✓ Custom preferences</li>
              </ul>
            </div>
          </div>
          
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {loading 
              ? 'Processing...' 
              : selectedPlan === 'free' 
                ? 'Continue with Free Plan' 
                : `Subscribe to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan`
            }
          </button>
        </div>
      )}

      {/* Subscription History */}
      {subscriptions.length > 1 && (
        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map(sub => (
                    <tr key={sub.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{sub.plan_id.toUpperCase()}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{sub.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(sub.current_period_start).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage; 
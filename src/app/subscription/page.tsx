'use client';

import { useState, useEffect, Suspense } from 'react';
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

// Separate component that uses useSearchParams to resolve Next.js warnings
function SubscriptionContent() {
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
            <p><span className="font-medium">Plan:</span> {activeSubscription.plan_id.charAt(0).toUpperCase() + activeSubscription.plan_id.slice(1)}</p>
            <p><span className="font-medium">Status:</span> {activeSubscription.status.charAt(0).toUpperCase() + activeSubscription.status.slice(1)}</p>
            {subscriptionEndsAt && <p><span className="font-medium">Current period ends:</span> {subscriptionEndsAt}</p>}
            {activeSubscription.cancel_at_period_end && (
              <p className="mt-2 text-amber-600">Your subscription is set to cancel at the end of the current billing period.</p>
            )}
            {activeSubscription.status === 'active' && !activeSubscription.cancel_at_period_end && (
              <button
                onClick={handleCancelSubscription}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        ) : (
          <p>You currently don't have an active subscription.</p>
        )}
      </div>

      {/* Subscription Plans */}
      {(!activeSubscription || activeSubscription.cancel_at_period_end) && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Plans</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div
              className={`border rounded-lg p-6 cursor-pointer transition-all ${selectedPlan === 'free' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
              onClick={() => handleSelectPlan('free')}
            >
              <h3 className="text-lg font-semibold mb-2">Free</h3>
              <p className="text-2xl font-bold mb-4">$0 <span className="text-sm font-normal text-gray-600">/month</span></p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>5 meeting requests/month</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Basic features</span>
                </li>
              </ul>
            </div>

            {/* Basic Plan */}
            <div
              className={`border rounded-lg p-6 cursor-pointer transition-all ${selectedPlan === 'basic' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
              onClick={() => handleSelectPlan('basic')}
            >
              <h3 className="text-lg font-semibold mb-2">Basic</h3>
              <p className="text-2xl font-bold mb-4">$9.99 <span className="text-sm font-normal text-gray-600">/month</span></p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Unlimited meeting requests</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Contact management</span>
                </li>
              </ul>
            </div>

            {/* Premium Plan */}
            <div
              className={`border rounded-lg p-6 cursor-pointer transition-all ${selectedPlan === 'premium' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
              onClick={() => handleSelectPlan('premium')}
            >
              <h3 className="text-lg font-semibold mb-2">Premium</h3>
              <p className="text-2xl font-bold mb-4">$19.99 <span className="text-sm font-normal text-gray-600">/month</span></p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Everything in Basic</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSubscribe}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Subscribe to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`}
            </button>
          </div>
        </div>
      )}

      {/* Subscription History */}
      {subscriptions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Subscription History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-left">Plan</th>
                  <th className="px-4 py-2 border-b text-left">Status</th>
                  <th className="px-4 py-2 border-b text-left">Created</th>
                  <th className="px-4 py-2 border-b text-left">Period End</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(sub => (
                  <tr key={sub.id}>
                    <td className="px-4 py-2 border-b">{sub.plan_id.charAt(0).toUpperCase() + sub.plan_id.slice(1)}</td>
                    <td className="px-4 py-2 border-b">{sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}</td>
                    <td className="px-4 py-2 border-b">{new Date(sub.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border-b">{sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Main component with Suspense boundary
export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}

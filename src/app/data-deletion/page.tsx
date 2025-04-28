'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function DataDeletionPage() {
  const { user, logout } = useAuth();
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) {
      setError('You must be logged in to delete your account.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setDeleted(true);
        // Log the user out after successful deletion
        await logout();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete account. Please contact support.');
      }
    } catch (err) {
      setError('An error occurred while trying to delete your account. Please try again later.');
      console.error('Account deletion error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Data Deletion Instructions</h1>

      {deleted ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Your account and all associated data have been successfully deleted. Thank you for using Find A Meeting Spot.
        </div>
      ) : (
        <>
          <section className="mb-8">
            <p className="mb-5 text-gray-700">
              At Find A Meeting Spot, we value your privacy and understand the importance of having control over your personal data.
              We've made the process of deleting your data straightforward and comprehensive, ensuring all your information is
              properly removed from our systems when requested.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">For Facebook Users</h2>
            <p className="mb-3">
              If you connected your account using Facebook and wish to delete your data, you have two options:
            </p>
            <ol className="list-decimal ml-6 mb-4 space-y-2">
              <li>
                <strong>Delete through Facebook:</strong> Visit your Facebook settings, go to "Apps and Websites,"
                find Find A Meeting Spot, and remove access. This will disconnect your Facebook account from our service,
                though some data may remain in our systems.
              </li>
              <li>
                <strong>Delete directly from our platform:</strong> If you're logged in, you can delete your account
                using the button below, which will remove all your data from our servers. This is the most comprehensive
                option and ensures complete removal of your information.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">For Google Sign-In Users</h2>
            <p className="mb-3">
              If you're using Google to sign in to our platform and wish to delete your data, you have these options:
            </p>
            <ol className="list-decimal ml-6 mb-4 space-y-2">
              <li>
                <strong>Revoke access through Google:</strong> Visit your Google Account settings, go to "Security" then "Third-party apps with account access,"
                find Find A Meeting Spot, and remove access. This will disconnect your Google account, but won't delete all your data from our systems.
              </li>
              <li>
                <strong>Complete deletion through our platform:</strong> Use the "Delete My Account and Data" button below while logged in
                to completely remove all your data from our servers.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">For All Users</h2>
            <p className="mb-3">
              When you delete your account, we permanently remove:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Your profile information and authentication details</li>
              <li>Your meeting requests, responses, and historical meeting data</li>
              <li>Your saved contacts and address book</li>
              <li>Your location data and preferences</li>
              <li>Your subscription information and payment details</li>
              <li>Any user-specific settings or configurations</li>
            </ul>
            <p className="mb-3">
              This process is irreversible and typically completed within 30 days. Once processed, your data cannot be recovered.
              If you wish to use our service again after deletion, you'll need to create a new account.
            </p>
            <p className="mb-3 text-gray-600 italic">
              Note: While we remove all personal data immediately, some anonymized aggregate data used for analytics may remain.
              This data cannot be used to identify you in any way.
            </p>
          </section>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {user ? (
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete My Account and Data'}
            </button>
          ) : (
            <p className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              You must be logged in to delete your account. Please log in first.
            </p>
          )}
        </>
      )}

      <section className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
        <p>
          If you have any questions about data deletion, privacy concerns, or need assistance with removing your account, please contact us at{' '}
          <a href="mailto:privacy@findameetingspot.com" className="text-blue-600 hover:underline">
            privacy@findameetingspot.com
          </a>. We're here to help you with any data-related inquiries.
        </p>
      </section>
    </div>
  );
}

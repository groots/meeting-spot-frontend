import { useState } from 'react';

interface CreateRequestFormProps {
  onSubmit: (data: {
    address_a: string;
    location_type: string;
    user_b_contact_type: string;
    user_b_contact: string;
  }) => Promise<void>;
}

export default function CreateRequestForm({ onSubmit }: CreateRequestFormProps) {
  const [formData, setFormData] = useState({
    address_a: '',
    location_type: 'Restaurant',
    user_b_contact_type: 'email',
    user_b_contact: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Meeting Request</h2>
      
      <div>
        <label htmlFor="address_a" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Your Address
        </label>
        <input
          type="text"
          id="address_a"
          name="address_a"
          value={formData.address_a}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter your address"
        />
      </div>

      <div>
        <label htmlFor="location_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Preferred Location Type
        </label>
        <select
          id="location_type"
          name="location_type"
          value={formData.location_type}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="Restaurant">Restaurant</option>
          <option value="Cafe">Cafe</option>
          <option value="Bar">Bar</option>
          <option value="Park">Park</option>
          <option value="Library">Library</option>
          <option value="Community Center">Community Center</option>
        </select>
      </div>

      <div>
        <label htmlFor="user_b_contact_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Contact Method
        </label>
        <select
          id="user_b_contact_type"
          name="user_b_contact_type"
          value={formData.user_b_contact_type}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
        </select>
      </div>

      <div>
        <label htmlFor="user_b_contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Contact Information
        </label>
        <input
          type={formData.user_b_contact_type === 'email' ? 'email' : 'tel'}
          id="user_b_contact"
          name="user_b_contact"
          value={formData.user_b_contact}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder={formData.user_b_contact_type === 'email' ? 'Enter email address' : 'Enter phone number'}
        />
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating...' : 'Create Request'}
      </button>
    </form>
  );
} 
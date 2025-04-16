import { useState, useEffect } from 'react';
import { Contact, getContacts } from '@/app/api/contacts';
import { useAuth } from '@/app/contexts/AuthContext';
import Spinner from './ui/Spinner';

interface ContactSelectorProps {
  onChange: (contactInfo: string, contactType: string) => void;
  defaultContactType?: string;
  defaultContactInfo?: string;
}

export default function ContactSelector({ 
  onChange, 
  defaultContactType = 'EMAIL',
  defaultContactInfo = ''
}: ContactSelectorProps) {
  const { token, user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useExistingContact, setUseExistingContact] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [contactMethod, setContactMethod] = useState(defaultContactType);
  const [contactInfo, setContactInfo] = useState(defaultContactInfo);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Load contacts if user is authenticated
  useEffect(() => {
    const loadContacts = async () => {
      if (!isAuthenticated || !token) return;
      
      try {
        setLoading(true);
        const fetchedContacts = await getContacts(token);
        setContacts(fetchedContacts);
        
        // If contacts exist, default to using existing contacts
        if (fetchedContacts.length > 0) {
          setUseExistingContact(true);
        }
      } catch (err: any) {
        console.error('Error loading contacts:', err);
        
        // Check if this is a premium feature error (402 status)
        if (err.message && err.message.includes('premium subscription')) {
          setError('Contacts management requires a premium subscription. You can still enter contact information manually.');
        } else {
          setError('Could not load contacts. You can still enter contact information manually.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [token, isAuthenticated]);

  // Handle contact selection
  const handleContactSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contactId = e.target.value;
    setSelectedContactId(contactId);
    
    if (contactId) {
      const selectedContact = contacts.find(c => c.id === contactId);
      if (selectedContact) {
        // Determine which contact method to use based on available data
        if (selectedContact.email) {
          setContactMethod('EMAIL');
          setContactInfo(selectedContact.email);
          onChange(selectedContact.email, 'EMAIL');
        } else if (selectedContact.phone) {
          setContactMethod('PHONE');
          setContactInfo(selectedContact.phone);
          onChange(selectedContact.phone, 'PHONE');
        }
      }
    }
  };

  // Handle manual contact info changes
  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactInfo(e.target.value);
    onChange(e.target.value, contactMethod);
  };

  // Handle contact method changes
  const handleContactMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setContactMethod(e.target.value);
    onChange(contactInfo, e.target.value);
  };

  // Toggle between existing contact and manual entry
  const handleToggleContactMode = (useExisting: boolean) => {
    setUseExistingContact(useExisting);
    
    // Reset values when switching modes
    if (useExisting) {
      if (selectedContactId) {
        const selectedContact = contacts.find(c => c.id === selectedContactId);
        if (selectedContact) {
          if (selectedContact.email) {
            setContactMethod('EMAIL');
            setContactInfo(selectedContact.email);
            onChange(selectedContact.email, 'EMAIL');
          } else if (selectedContact.phone) {
            setContactMethod('PHONE');
            setContactInfo(selectedContact.phone);
            onChange(selectedContact.phone, 'PHONE');
          }
        }
      }
    } else {
      setContactInfo(defaultContactInfo);
      setContactMethod(defaultContactType);
      onChange(defaultContactInfo, defaultContactType);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-4">
      {isAuthenticated && contacts.length > 0 && (
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => handleToggleContactMode(true)}
            className={`px-3 py-2 text-sm rounded-md ${
              useExistingContact 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Use Existing Contact
          </button>
          <button
            type="button"
            onClick={() => handleToggleContactMode(false)}
            className={`px-3 py-2 text-sm rounded-md ${
              !useExistingContact 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Enter New Contact
          </button>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {isAuthenticated && useExistingContact && contacts.length > 0 ? (
        <div className="space-y-2">
          <label htmlFor="contactSelect" className="block text-sm font-medium text-gray-700">
            Select Contact
          </label>
          <select
            id="contactSelect"
            value={selectedContactId}
            onChange={handleContactSelect}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select a contact</option>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>
                {contact.name} {contact.email ? `(${contact.email})` : contact.phone ? `(${contact.phone})` : ''}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-700">
              Contact Method
            </label>
            <select
              id="contactMethod"
              value={contactMethod}
              onChange={handleContactMethodChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="EMAIL">Email</option>
              <option value="PHONE">Phone</option>
              <option value="SMS">SMS</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">
              Contact Information
            </label>
            <input
              type={contactMethod === 'EMAIL' ? 'email' : 'tel'}
              id="contactInfo"
              value={contactInfo}
              onChange={handleContactInfoChange}
              placeholder={contactMethod === 'EMAIL' ? 'Enter email address' : 'Enter phone number'}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </>
      )}
    </div>
  );
} 
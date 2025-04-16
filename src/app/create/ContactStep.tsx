import React, { useEffect, useState } from 'react';
import { getContacts } from '../../services/contacts';

const ContactStep = () => {
  const [token, setToken] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [premiumRequired, setPremiumRequired] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    if (token) {
      const fetchContacts = async () => {
        try {
          setLoading(true);
          const contactsData = await getContacts(token);
          
          // Check if premium feature
          if ('premiumRequired' in contactsData) {
            // Premium feature - don't show error
            setContacts([]);
            setPremiumRequired(true);
          } else {
            // Regular data
            setContacts(contactsData);
            setPremiumRequired(false);
            setError(null);
          }
        } catch (err) {
          console.error('Error fetching contacts:', err);
          setError('Could not load contacts. You can still enter contact information manually.');
        } finally {
          setLoading(false);
        }
      };

      fetchContacts();
    }
  }, [token]);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default ContactStep; 
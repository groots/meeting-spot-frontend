import React, { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getContacts, createContact } from "@/app/api/contacts";
import { useAuth } from "@/app/contexts/AuthContext";
import type { Contact } from '@/app/api/contacts';

// Simple inline spinner component
const SimpleSpinner = () => (
  <div className="flex justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
  </div>
);

type ContactSelectorProps = {
  defaultContactInfo?: string;
  defaultContactType?: string;
  onChange: (info: string, type: string) => void;
  error?: string;
  saveContact?: boolean;
};

export default function ContactSelector({
  defaultContactInfo = '',
  defaultContactType = 'email',
  onChange,
  error,
  saveContact = false,
}: ContactSelectorProps) {
  const { token, user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [useExistingContact, setUseExistingContact] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [contactMethod, setContactMethod] = useState(defaultContactType);
  const [contactInfo, setContactInfo] = useState(defaultContactInfo);
  const [contactType, setContactType] = useState<"email" | "phone">(
    (defaultContactType as "email" | "phone") === "phone" ? "phone" : "email"
  );
  const [contactName, setContactName] = useState('');
  const [shouldSaveContact, setShouldSaveContact] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Initialize contactMethod and contactType once on component mount
  useEffect(() => {
    setContactMethod(defaultContactType);
    setContactType((defaultContactType as "email" | "phone") === "phone" ? "phone" : "email");

    // Call onChange with initial values if defaultContactInfo is provided
    if (defaultContactInfo) {
      onChange(defaultContactInfo, defaultContactType);
    }
  }, []);

  // Handle contact type changes
  const handleContactTypeChange = (newType: "email" | "phone") => {
    setContactType(newType);
    setContactMethod(newType);
    onChange(contactInfo, newType);
  };

  // Handle contact info changes
  const handleContactInfoChange = (newInfo: string) => {
    setContactInfo(newInfo);
    onChange(newInfo, contactType);
  };

  // Initialize useExistingContact based on contacts outside the effect
  useEffect(() => {
    // Ensure contacts is an array before using find
    if (contacts && Array.isArray(contacts) && contacts.length > 0 && defaultContactInfo) {
      // Find default contact after contacts are loaded
      const foundContact = contacts.find(
        (c) =>
          (contactType === 'email' && c.email === defaultContactInfo) ||
          (contactType === 'phone' && c.phone === defaultContactInfo)
      );
      if (foundContact) {
        setUseExistingContact(true);
        setSelectedContactId(foundContact.id);
      }
    }
  }, [contacts, defaultContactInfo, contactType]);

  useEffect(() => {
    // Only load contacts if the user is logged in
    if (token && user?.id) {
      setLoadingContacts(true);
      getContacts(token)
        .then((data) => {
          // Always ensure contacts is set to an array
          if (Array.isArray(data)) {
            setContacts(data);
          } else {
            console.error("Contacts data is not an array:", data);
            setContacts([]);
          }
        })
        .catch((err) => {
          console.error("Failed to load contacts:", err);
          setLoadingError("Failed to load contacts");
          setContacts([]); // Ensure contacts is always an array
        })
        .finally(() => {
          setLoadingContacts(false);
        });
    } else {
      // If not logged in, ensure contacts is set to empty array
      setContacts([]);
    }
  }, [token, user?.id]);

  // Extend the Contact type to include the properties we need
  interface EnhancedContact extends Contact {
    type: "email" | "phone";
  }

  // Safe lookup for defaultContact - ensure contacts is an array first
  const defaultContact = useMemo(() => {
    if (!Array.isArray(contacts) || !contacts.length || !defaultContactInfo) return undefined;
    
    return contacts.find((c) =>
      (contactType === 'email' && c.email === defaultContactInfo) ||
      (contactType === 'phone' && c.phone === defaultContactInfo)
    );
  }, [contacts, contactType, defaultContactInfo]);

  // Ensure contacts is treated as an array for rendering
  const contactsArray = useMemo(() => {
    return Array.isArray(contacts) ? contacts : [];
  }, [contacts]);

  if (loading) {
    return <SimpleSpinner />;
  }

  // Email icon SVG
  const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  );

  // Phone icon SVG
  const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="existing"
                name="contactMode"
                value="existing"
                checked={useExistingContact}
                onChange={() => setUseExistingContact(true)}
                className="border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <Label htmlFor="existing" className="text-gray-700 font-medium cursor-pointer">
                Use existing contact
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="new"
                name="contactMode"
                value="new"
                checked={!useExistingContact}
                onChange={() => setUseExistingContact(false)}
                className="border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <Label htmlFor="new" className="text-gray-700 font-medium cursor-pointer">
                Enter new contact
              </Label>
            </div>
          </div>
        </div>
      </div>

      {useExistingContact ? (
        <div>
          {contactsArray.length > 0 ? (
            <select
              onChange={(e) => {
                const contactId = e.target.value;
                if (!contactId) return;
                
                // Find the selected contact safely
                const contact = contactsArray.find((c) => c.id === contactId);
                if (contact) {
                  const contactValue = contact.email || contact.phone || "";
                  const contactType = contact.email ? "email" : "phone";
                  onChange(contactValue, contactType);
                  setSelectedContactId(contactId);
                }
              }}
              value={selectedContactId || ""}
              className="w-full border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg shadow-sm transition-all duration-200 p-2"
            >
              <option value="" disabled>Select a contact</option>
              {contactsArray.map((contact) => {
                // Determine contact type based on whether email or phone is present
                const contactType = contact.email ? "email" : "phone";
                return (
                  <option key={contact.id} value={contact.id}>
                    {contact.name || (contactType === "email" ? contact.email : contact.phone)}
                    {contactType === "email" ? " (Email)" : " (Phone)"}
                  </option>
                );
              })}
            </select>
          ) : (
            <div className="text-sm text-gray-500 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              {loadingContacts ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500 mr-2" />
                  <span>Loading your contacts...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <span>You don't have any saved contacts yet.</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUseExistingContact(false)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    Enter a new contact instead
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="contactType" className="text-gray-600 text-sm">
                Contact Type
              </Label>
              <div className="relative">
                <select
                  id="contactType"
                  value={contactType}
                  onChange={(e) => {
                    handleContactTypeChange(e.target.value as "email" | "phone");
                  }}
                  className="w-full border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg shadow-sm transition-all duration-200 p-2 pl-10"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {contactType === "email" ? <EmailIcon /> : <PhoneIcon />}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <Label htmlFor="contactInfo" className="text-gray-600 text-sm">
                {contactType === "email" ? "Email Address" : "Phone Number"}
              </Label>
              <div className="relative">
                <Input
                  id="contactInfo"
                  type={contactType === "email" ? "email" : "tel"}
                  placeholder={
                    contactType === "email" ? "email@example.com" : "+1 (555) 555-5555"
                  }
                  value={contactInfo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleContactInfoChange(e.target.value);
                  }}
                  className="w-full pl-10 border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg shadow-sm transition-all duration-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {contactType === "email" ? <EmailIcon /> : <PhoneIcon />}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="contactName" className="text-gray-600 text-sm">
              Contact Name (Optional)
            </Label>
            <Input
              id="contactName"
              type="text"
              placeholder="John Doe"
              value={contactName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactName(e.target.value)}
              className="w-full border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg shadow-sm transition-all duration-200"
            />
          </div>

          {saveContact && (
            <div className="flex items-center mt-3">
              <input
                type="checkbox"
                id="saveContact"
                checked={shouldSaveContact}
                onChange={(e) => setShouldSaveContact(e.target.checked)}
                className="border-gray-300 text-blue-500 focus:ring-blue-500 mr-2"
              />
              <Label htmlFor="saveContact" className="text-gray-600 text-sm cursor-pointer">
                Save this contact for future use
              </Label>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 text-red-500 text-sm bg-red-50 p-2 rounded-md border border-red-100">
          {error}
        </div>
      )}

      {loadingError && (
        <div className="mt-2 text-red-500 text-sm bg-red-50 p-2 rounded-md border border-red-100">
          {loadingError}
        </div>
      )}
    </div>
  );
}

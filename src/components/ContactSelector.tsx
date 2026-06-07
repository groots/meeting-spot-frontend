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
    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
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
                className="border-border text-primary focus:ring-ring"
              />
              <Label htmlFor="existing" className="font-medium cursor-pointer">
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
                className="border-border text-primary focus:ring-ring"
              />
              <Label htmlFor="new" className="font-medium cursor-pointer">
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
              className="w-full rounded-lg border border-border bg-surface p-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
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
            <div className="text-sm text-muted-foreground p-3 bg-surface-muted border border-border rounded-lg">
              {loadingContacts ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                  <span>Loading your contacts...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <span>You don't have any saved contacts yet.</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUseExistingContact(false)}
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
              <Label htmlFor="contactType" className="text-sm">
                Contact Type
              </Label>
              <select
                id="contactType"
                value={contactType}
                onChange={(e) => {
                  handleContactTypeChange(e.target.value as "email" | "phone");
                }}
                className="w-full rounded-lg border border-border bg-surface p-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>

            <div className="flex-1 space-y-1">
              <Label htmlFor="contactInfo" className="text-sm">
                {contactType === "email" ? "Email Address" : "Phone Number"}
              </Label>
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
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="contactName" className="text-sm">
              Contact Name (Optional)
            </Label>
            <Input
              id="contactName"
              type="text"
              placeholder="John Doe"
              value={contactName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactName(e.target.value)}
            />
          </div>

          {saveContact && (
            <div className="flex items-center mt-3">
              <input
                type="checkbox"
                id="saveContact"
                checked={shouldSaveContact}
                onChange={(e) => setShouldSaveContact(e.target.checked)}
                className="border-border text-primary focus:ring-ring mr-2"
              />
              <Label htmlFor="saveContact" className="text-sm cursor-pointer">
                Save this contact for future use
              </Label>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 text-error text-sm bg-error/10 p-2 rounded-lg border border-error/20">
          {error}
        </div>
      )}

      {loadingError && (
        <div className="mt-2 text-error text-sm bg-error/10 p-2 rounded-lg border border-error/20">
          {loadingError}
        </div>
      )}
    </div>
  );
}

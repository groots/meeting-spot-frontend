'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { 
  getContacts, 
  getContact, 
  createContact, 
  updateContact, 
  deleteContact,
  Contact, 
  ContactWithMeetings 
} from '../api/contacts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ContactsPage = () => {
  const { token, user } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactWithMeetings | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');
  const [premiumRequired, setPremiumRequired] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
  });

  // Check if user is authenticated, redirect to login if not
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Load user contacts
  useEffect(() => {
    const loadContacts = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const data = await getContacts(token);
        setContacts(data);
        
        // Check if the user needs premium subscription for contacts
        if ('premiumRequired' in data) {
          setError(null); // Clear any existing errors
          setPremiumRequired(true);
        } else {
          setPremiumRequired(false);
        }
      } catch (err) {
        console.error('Error loading contacts:', err);
        setError('Failed to load contacts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [token]);

  const handleCreateContact = () => {
    setSelectedContact(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: ''
    });
    setIsCreateMode(true);
    setIsModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      notes: contact.notes || ''
    });
    setIsCreateMode(false);
    setIsModalOpen(true);
  };

  const handleViewContact = async (id: string) => {
    if (!token) return;
    
    try {
      setLoading(true);
      const contact = await getContact(id, token);
      setSelectedContact(contact);
      setIsCreateMode(false);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error loading contact details:', err);
      setError('Failed to load contact details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      setLoading(true);
      await deleteContact(id, token);
      setContacts(contacts.filter(c => c.id !== id));
      setSuccessMessage('Contact deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (isCreateMode) {
        // Create new contact
        const newContact = await createContact(formData, token);
        setContacts([...contacts, newContact]);
        setSuccessMessage('Contact created successfully');
      } else if (selectedContact) {
        // Update existing contact
        const updated = await updateContact(selectedContact.id, formData, token);
        setContacts(contacts.map(c => c.id === updated.id ? updated : c));
        setSuccessMessage('Contact updated successfully');
      }
      
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving contact:', err);
      
      // Check if it's a premium feature error
      if (err.message && err.message.includes('premium subscription')) {
        setError('This feature requires a premium subscription. Please upgrade your plan.');
        setTimeout(() => {
          router.push('/subscription');
        }, 2000);
      } else {
        setError('Failed to save contact. Please try again.');
      }
      
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.phone?.toLowerCase().includes(query) ||
      contact.company?.toLowerCase().includes(query)
    );
  });

  // Get recently added contacts (last 30 days)
  const recentContacts = contacts.filter(contact => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(contact.created_at) >= thirtyDaysAgo;
  });

  // Determine which contacts to display based on active tab
  const displayedContacts = activeTab === 'all' ? filteredContacts : recentContacts.filter(contact => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.phone?.toLowerCase().includes(query) ||
      contact.company?.toLowerCase().includes(query)
    );
  });

  if (loading && contacts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <Button
          onClick={handleCreateContact}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading || premiumRequired}
        >
          Add Contact
        </Button>
      </div>
      
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

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          {/* Search Bar */}
          <div className="w-full md:w-1/2">
            <Input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full"
              disabled={loading || premiumRequired}
            />
          </div>
          
          {/* Tabs */}
          <div className="flex border rounded-md">
            <button
              className={`px-4 py-2 ${activeTab === 'all' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-white text-gray-600'}`}
              onClick={() => setActiveTab('all')}
              disabled={loading || premiumRequired}
            >
              All Contacts
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'recent' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-white text-gray-600'}`}
              onClick={() => setActiveTab('recent')}
              disabled={loading || premiumRequired}
            >
              Recent
            </button>
          </div>
        </div>
      </div>
      
      {/* Premium required message */}
      {premiumRequired && (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg shadow-sm mb-6">
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">Premium Feature</h3>
          <p className="text-yellow-700 mb-4">Contact management is a premium feature that allows you to save and organize your meeting participants.</p>
          <div className="flex justify-between items-center">
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              <li>Save contacts from meeting requests</li>
              <li>Organize your contacts</li>
              <li>Quick access to previous meeting participants</li>
            </ul>
            <Button 
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white"
              onClick={() => router.push('/subscription')}
            >
              Upgrade to Premium
            </Button>
          </div>
        </div>
      )}

      {displayedContacts.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-600">
            {activeTab === 'all' 
              ? (searchQuery 
                ? 'No contacts match your search.' 
                : "You don't have any contacts yet.")
              : (searchQuery 
                ? 'No recent contacts match your search.' 
                : "You don't have any recent contacts.")
            }
          </p>
          {!searchQuery && (
            <Button
              onClick={handleCreateContact}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Your First Contact
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedContacts.map(contact => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{contact.email || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{contact.phone || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{contact.company || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewContact(contact.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditContact(contact)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contact Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {isCreateMode ? 'Add New Contact' : (selectedContact ? 'Contact Details' : '')}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name*</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add notes about this contact"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                {/* Contact Meetings (when viewing details) */}
                {!isCreateMode && selectedContact?.meetings && selectedContact.meetings.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Meeting History</h3>
                    <div className="max-h-40 overflow-y-auto border rounded">
                      {selectedContact.meetings.map(meeting => (
                        <div key={meeting.id} className="p-3 border-b last:border-b-0">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                {new Date(meeting.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                Status: {meeting.status}
                              </p>
                            </div>
                            {meeting.selected_place && (
                              <div className="text-right text-sm">
                                <p className="font-medium">{meeting.selected_place.name}</p>
                                <p className="text-xs truncate max-w-[180px]">
                                  {meeting.selected_place.address}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Premium required message */}
                {selectedContact?.premium_required && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                    Upgrade to premium to view meeting history with this contact.
                    <Button
                      type="button"
                      onClick={() => router.push('/subscription')}
                      className="mt-2 w-full py-1 text-sm bg-yellow-500 hover:bg-yellow-600"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (isCreateMode ? 'Create Contact' : 'Update Contact')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage; 
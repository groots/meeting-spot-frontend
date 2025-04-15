import { useState } from 'react';
import { createContactFromMeeting } from '@/app/api/contacts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/app/contexts/AuthContext';

interface AddContactModalProps {
  meetingId: string;
  contactEmail: string; // Email extracted from the meeting request
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddContactModal({
  meetingId,
  contactEmail,
  isOpen,
  onClose,
  onSuccess,
}: AddContactModalProps) {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('You must be logged in to add contacts');
      return;
    }

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createContactFromMeeting(
        meetingId,
        {
          name: name.trim(),
          phone: phone.trim() || undefined,
          company: company.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        token
      );
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error adding contact:', err);
      
      // Check if it's a premium feature error
      if (err.message && err.message.includes('premium subscription')) {
        setError('This feature requires a premium subscription. Please upgrade your plan.');
      } else {
        setError(err.message || 'Failed to add contact');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add to Contacts</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={contactEmail}
                disabled
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="name">Name*</Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Enter contact name"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                placeholder="Enter phone number (optional)"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                type="text"
                id="company"
                value={company}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
                placeholder="Enter company name (optional)"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                placeholder="Add notes about this contact (optional)"
                className="mt-1"
                rows={3}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-800 rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Add Contact'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
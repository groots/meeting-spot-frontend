import { getContacts, getContact, createContact, updateContact, deleteContact, createContactFromMeeting } from '../contacts';
import { API_ENDPOINTS } from '../../config';

// Mock global fetch
global.fetch = jest.fn();

describe('Contacts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockToken = 'test-token';
  const mockContact = {
    id: '123',
    name: 'Test Contact',
    email: 'test@example.com',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };

  describe('getContacts', () => {
    it('should fetch contacts successfully', async () => {
      const mockResponse = [mockContact];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });

      const result = await getContacts(mockToken);
      
      expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.contacts, {
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockToken}`
        })
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors', async () => {
      const errorMessage = 'Failed to fetch contacts';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({ message: errorMessage })
      });

      await expect(getContacts(mockToken)).rejects.toThrow(errorMessage);
    });
  });

  describe('getContact', () => {
    it('should fetch a single contact successfully', async () => {
      const contactId = '123';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockContact)
      });

      const result = await getContact(contactId, mockToken);
      
      expect(fetch).toHaveBeenCalledWith(`${API_ENDPOINTS.contacts}/${contactId}`, {
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockToken}`
        })
      });
      expect(result).toEqual(mockContact);
    });
  });

  describe('createContact', () => {
    it('should create a contact successfully', async () => {
      const contactData = {
        name: 'Test Contact',
        email: 'test@example.com'
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockContact)
      });

      const result = await createContact(contactData, mockToken);
      
      expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.contacts, {
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockToken}`
        }),
        body: JSON.stringify(contactData)
      });
      expect(result).toEqual(mockContact);
    });
  });

  describe('updateContact', () => {
    it('should update a contact successfully', async () => {
      const contactId = '123';
      const updateData = { name: 'Updated Name' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({...mockContact, name: 'Updated Name'})
      });

      const result = await updateContact(contactId, updateData, mockToken);
      
      expect(fetch).toHaveBeenCalledWith(`${API_ENDPOINTS.contacts}/${contactId}`, {
        method: 'PUT',
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockToken}`
        }),
        body: JSON.stringify(updateData)
      });
      expect(result.name).toEqual('Updated Name');
    });
  });

  describe('deleteContact', () => {
    it('should delete a contact successfully', async () => {
      const contactId = '123';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({})
      });

      await deleteContact(contactId, mockToken);
      
      expect(fetch).toHaveBeenCalledWith(`${API_ENDPOINTS.contacts}/${contactId}`, {
        method: 'DELETE',
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockToken}`
        })
      });
    });
  });

  describe('createContactFromMeeting', () => {
    it('should create a contact from meeting successfully', async () => {
      const meetingId = '456';
      const contactData = {
        name: 'Meeting Contact',
        phone: '123-456-7890'
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockContact)
      });

      const result = await createContactFromMeeting(meetingId, contactData, mockToken);
      
      expect(fetch).toHaveBeenCalledWith(`${API_ENDPOINTS.contacts}/from-meeting/${meetingId}`, {
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockToken}`
        }),
        body: JSON.stringify(contactData)
      });
      expect(result).toEqual(mockContact);
    });
  });
}); 
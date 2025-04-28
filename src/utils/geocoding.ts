import { GOOGLE_MAPS_API_KEY, API_ENDPOINTS } from '@/app/config';

interface GeocodingResponse {
  success: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  formatted_address?: string;
  error?: string;
}

/**
 * Geocode an address string to latitude and longitude coordinates
 * Uses the backend geocoding service which handles API key management
 */
export async function geocodeAddress(address: string): Promise<{ lat: number, lng: number } | null> {
  try {
    // Call our backend geocoding API endpoint
    const response = await fetch(API_ENDPOINTS.geocoding, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });

    const data: GeocodingResponse = await response.json();

    if (data.success && data.coordinates) {
      const { lat, lng } = data.coordinates;
      console.log(`Geocoded address "${address}" to coordinates: (${lat}, ${lng})`);
      return { lat, lng };
    } else {
      console.error(`Geocoding failed: ${data.error || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Fallback geocoding function using Google Maps API directly
 * Only used if the backend geocoding service is unavailable
 */
export async function fallbackGeocodeAddress(address: string): Promise<{ lat: number, lng: number } | null> {
  try {
    // Use Google Maps Geocoding API directly
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      console.log(`Fallback geocoded address "${address}" to coordinates: (${lat}, ${lng})`);
      return { lat, lng };
    } else {
      console.error(`Fallback geocoding failed with status: ${data.status}`, data);
      return null;
    }
  } catch (error) {
    console.error('Error in fallback geocoding:', error);
    return null;
  }
}

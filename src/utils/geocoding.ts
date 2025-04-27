import { GOOGLE_MAPS_API_KEY } from '@/app/config';

/**
 * Geocode an address string to latitude and longitude coordinates
 */
export async function geocodeAddress(address: string): Promise<{ lat: number, lng: number } | null> {
  try {
    // Use Google Maps Geocoding API to get coordinates
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      console.log(`Geocoded address "${address}" to coordinates: (${lat}, ${lng})`);
      return { lat, lng };
    } else {
      console.error(`Geocoding failed with status: ${data.status}`, data);
      return null;
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
} 
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
    // Check if this is already a Location (lat, lng) format to skip reverse geocoding
    const locationPattern = /Location \((-?\d+\.\d+), (-?\d+\.\d+)\)/;
    const locationMatch = address.match(locationPattern);
    
    // Call our backend geocoding API endpoint
    const response = await fetch(API_ENDPOINTS.geocoding, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // If it's a Location format, tell the backend to skip reverse geocoding
      body: JSON.stringify({ 
        address, 
        skip_reverse: !!locationMatch 
      }),
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
 * Reverse geocode coordinates to a human-readable address
 * Uses the backend geocoding service which handles API key management
 */
export async function reverseGeocodeCoordinates(
  lat: number, 
  lng: number
): Promise<string | null> {
  try {
    // Call our backend geocoding API endpoint
    const response = await fetch(API_ENDPOINTS.geocoding, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat, lng }),
    });

    const data: GeocodingResponse = await response.json();

    if (data.success && data.formatted_address) {
      console.log(`Reverse geocoded (${lat}, ${lng}) to address: ${data.formatted_address}`);
      return data.formatted_address;
    } else {
      console.error(`Reverse geocoding failed: ${data.error || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.error('Error reverse geocoding coordinates:', error);
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

/**
 * Fallback reverse geocoding function using Google Maps API directly
 * Only used if the backend reverse geocoding service is unavailable
 */
export async function fallbackReverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    // Use Google Maps Geocoding API directly with latlng parameter
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      // Find the most appropriate address result
      let address = data.results[0].formatted_address;

      // Look for a result that contains a street address if available
      for (const result of data.results) {
        const addressTypes = result.types || [];
        if (
          addressTypes.includes('street_address') ||
          addressTypes.includes('route') ||
          addressTypes.includes('premise')
        ) {
          address = result.formatted_address;
          break;
        }
      }

      console.log(`Fallback reverse geocoded (${lat}, ${lng}) to address: ${address}`);
      return address;
    } else {
      console.error(`Fallback reverse geocoding failed with status: ${data.status}`, data);
      return null;
    }
  } catch (error) {
    console.error('Error in fallback reverse geocoding:', error);
    return null;
  }
}

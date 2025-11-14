import { Client, TravelMode } from '@googlemaps/google-maps-services-js';
import { config } from '../config';
import { logger } from '../utils/logger';
import { InternalServerError } from '../utils/errors';

class GoogleMapsService {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  async getDistanceAndDuration(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<{ distance: number; duration: number; polyline: string }> {
    try {
      const response = await this.client.directions({
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          mode: TravelMode.driving,
          key: config.googleMaps.apiKey,
        },
      });

      if (response.data.status !== 'OK' || !response.data.routes.length) {
        throw new Error('Could not calculate route');
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance.value, // in meters
        duration: leg.duration.value, // in seconds
        polyline: route.overview_polyline.points,
      };
    } catch (error) {
      logger.error(`Google Maps API error: ${error}`);
      throw new InternalServerError('Failed to calculate route');
    }
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: config.googleMaps.apiKey,
        },
      });

      if (response.data.status !== 'OK' || !response.data.results.length) {
        throw new Error('Could not geocode address');
      }

      const location = response.data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } catch (error) {
      logger.error(`Geocoding error: ${error}`);
      throw new InternalServerError('Failed to geocode address');
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await this.client.reverseGeocode({
        params: {
          latlng: `${lat},${lng}`,
          key: config.googleMaps.apiKey,
        },
      });

      if (response.data.status !== 'OK' || !response.data.results.length) {
        throw new Error('Could not reverse geocode coordinates');
      }

      return response.data.results[0].formatted_address;
    } catch (error) {
      logger.error(`Reverse geocoding error: ${error}`);
      throw new InternalServerError('Failed to get address from coordinates');
    }
  }

  async findNearbyDrivers(
    latitude: number,
    longitude: number,
    radius: number = 5000
  ): Promise<any[]> {
    // This will be implemented with database query using PostGIS
    // For now, return empty array
    return [];
  }
}

export const googleMapsService = new GoogleMapsService();

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Calculate delivery price based on distance and duration
 */
export const calculateDeliveryPrice = (
  distanceInMeters: number,
  durationInSeconds: number
): number => {
  const distanceInKm = distanceInMeters / 1000;
  const durationInMinutes = durationInSeconds / 60;

  // Import pricing config
  const { baseFare, perKmRate, perMinuteRate, minimumFare } = {
    baseFare: 50,
    perKmRate: 20,
    perMinuteRate: 2,
    minimumFare: 100,
  };

  const distanceCost = distanceInKm * perKmRate;
  const timeCost = durationInMinutes * perMinuteRate;
  const totalCost = baseFare + distanceCost + timeCost;

  return Math.max(totalCost, minimumFare);
};

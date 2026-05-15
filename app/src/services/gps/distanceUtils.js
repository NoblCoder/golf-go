/**
 * GPS distance and geometry utilities
 *
 * @format
 */

const EARTH_RADIUS_METERS = 6371000; // meters

/**
 * Haversine formula for calculating distance between two GPS coordinates
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculate distance with elevation adjustment
 * @param {number} horizontalDistance - Horizontal distance in meters
 * @param {number} elevationChange - Elevation change in meters (positive = uphill)
 * @returns {number} "Plays like" distance in meters
 */
export function adjustForElevation(horizontalDistance, elevationChange) {
  // Rule of thumb: 1 yard elevation = ~1 yard distance adjustment
  // Uphill adds distance, downhill reduces
  const adjustment = elevationChange * 0.9; // Slightly less than 1:1
  return horizontalDistance + adjustment;
}

/**
 * Calculate distance from point to front/center/back of green
 * @param {Object} position - Current position {latitude, longitude}
 * @param {Array} greenPolygon - Array of {latitude, longitude} points
 * @returns {Object} {front, center, back} distances in meters
 */
export function calculateGreenDistances(position, greenPolygon) {
  if (!greenPolygon || greenPolygon.length < 3) {
    return { front: null, center: null, back: null };
  }

  // Calculate centroid
  const center = calculateCentroid(greenPolygon);
  const centerDistance = haversineDistance(
    position.latitude,
    position.longitude,
    center.latitude,
    center.longitude,
  );

  // Find axis (direction from tee to center)
  // For simplicity, use first point as tee reference
  const teePoint = greenPolygon[0];
  const axis = {
    lat: center.latitude - teePoint.latitude,
    lng: center.longitude - teePoint.longitude,
  };

  // Project all points onto axis to find front and back
  let minProjection = Infinity;
  let maxProjection = -Infinity;
  let frontPoint = null;
  let backPoint = null;

  greenPolygon.forEach((point) => {
    const projection =
      (point.latitude - teePoint.latitude) * axis.lat +
      (point.longitude - teePoint.longitude) * axis.lng;

    if (projection < minProjection) {
      minProjection = projection;
      frontPoint = point;
    }
    if (projection > maxProjection) {
      maxProjection = projection;
      backPoint = point;
    }
  });

  const frontDistance = frontPoint
    ? haversineDistance(
        position.latitude,
        position.longitude,
        frontPoint.latitude,
        frontPoint.longitude,
      )
    : null;

  const backDistance = backPoint
    ? haversineDistance(
        position.latitude,
        position.longitude,
        backPoint.latitude,
        backPoint.longitude,
      )
    : null;

  return {
    front: frontDistance,
    center: centerDistance,
    back: backDistance,
  };
}

/**
 * Calculate centroid of polygon
 */
function calculateCentroid(polygon) {
  const sum = polygon.reduce(
    (acc, point) => ({
      latitude: acc.latitude + point.latitude,
      longitude: acc.longitude + point.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: sum.latitude / polygon.length,
    longitude: sum.longitude / polygon.length,
  };
}

/**
 * Check if point is inside polygon
 * @param {Object} point - {latitude, longitude}
 * @param {Array} polygon - Array of {latitude, longitude}
 * @returns {boolean}
 */
export function isPointInPolygon(point, polygon) {
  if (!polygon || polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;

    const intersect =
      yi > point.latitude !== yj > point.latitude &&
      point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculate bearing between two points
 * @returns {number} Bearing in degrees (0-360)
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = toRadians(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
  const x =
    Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
    Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);

  let bearing = toDegrees(Math.atan2(y, x));
  bearing = (bearing + 360) % 360;

  return bearing;
}

/**
 * Calculate dispersion (left/right) from target line
 * @param {Object} startPos - Starting position
 * @param {Object} endPos - Ending position
 * @param {Object} targetPos - Target position
 * @returns {number} Dispersion in meters (negative = left, positive = right)
 */
export function calculateDispersion(startPos, endPos, targetPos) {
  // Vector from start to target
  const targetVector = {
    lat: targetPos.latitude - startPos.latitude,
    lng: targetPos.longitude - startPos.longitude,
  };

  // Vector from start to end
  const shotVector = {
    lat: endPos.latitude - startPos.latitude,
    lng: endPos.longitude - startPos.longitude,
  };

  // Cross product to find perpendicular distance
  // Positive = right, negative = left
  const crossProduct =
    shotVector.lng * targetVector.lat - shotVector.lat * targetVector.lng;

  // Convert to meters (approximate)
  const metersPerDegree = (EARTH_RADIUS_METERS * Math.PI) / 180;
  return crossProduct * metersPerDegree;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

/**
 * Convert meters to yards
 */
export function metersToYards(meters) {
  return meters * 1.09361;
}

/**
 * Convert yards to meters
 */
export function yardsToMeters(yards) {
  return yards / 1.09361;
}

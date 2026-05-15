/**
 * Kalman Filter for GPS smoothing
 * Reduces GPS jitter while maintaining responsiveness
 *
 * @format
 */

export class KalmanFilter {
  constructor() {
    // State
    this.lat = null;
    this.lng = null;
    this.variance = -1;

    // Process noise - how much we expect location to change
    this.processNoise = 0.5;
  }

  /**
   * Update filter with new GPS reading
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} accuracy - GPS accuracy in meters
   * @returns {{latitude: number, longitude: number}}
   */
  update(lat, lng, accuracy) {
    if (this.variance < 0) {
      // First reading - initialize
      this.lat = lat;
      this.lng = lng;
      this.variance = accuracy * accuracy;
    } else {
      // Kalman gain
      const kalmanGain = this.variance / (this.variance + accuracy * accuracy);

      // Update estimates
      this.lat += kalmanGain * (lat - this.lat);
      this.lng += kalmanGain * (lng - this.lng);

      // Update variance
      this.variance =
        (1 - kalmanGain) * this.variance + Math.abs(this.processNoise);
    }

    return {
      latitude: this.lat,
      longitude: this.lng,
    };
  }

  /**
   * Reset the filter
   */
  reset() {
    this.lat = null;
    this.lng = null;
    this.variance = -1;
  }
}

/** @format */

import * as Location from "expo-location";
import { KalmanFilter } from "./KalmanFilter";
import { haversineDistance } from "./distanceUtils";

/**
 * GPS Engine with movement detection and battery optimization
 */
export class GPSEngine {
  constructor() {
    this.kalmanFilter = new KalmanFilter();
    this.subscription = null;
    this.listeners = [];

    // State
    this.currentLocation = null;
    this.previousLocation = null;
    this.movementState = "still"; // still, walking, riding
    this.speed = 0; // m/s

    // Polling settings
    this.pollingInterval = 1000; // 1 Hz default
    this.minAccuracy = 20; // Reject readings worse than 20m

    // Movement thresholds
    this.stillThreshold = 0.3; // m/s
    this.walkingThreshold = 2.0; // m/s
    this.ridingThreshold = 3.0; // m/s

    // Battery optimization
    this.isBackground = false;
    this.idleTimeout = null;
    this.idleDelay = 30000; // 30 seconds
  }

  /**
   * Start GPS tracking
   */
  async start() {
    // Request permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission not granted");
    }

    // Start watching position
    this.subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: this.pollingInterval,
        distanceInterval: 0, // Get all updates
      },
      this.handleLocationUpdate.bind(this),
    );

    console.log("[GPSEngine] Started tracking");
  }

  /**
   * Stop GPS tracking
   */
  stop() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }

    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }

    console.log("[GPSEngine] Stopped tracking");
  }

  /**
   * Handle new location update
   */
  handleLocationUpdate(location) {
    const { coords } = location;

    // Check accuracy threshold
    if (coords.accuracy > this.minAccuracy) {
      console.log(`[GPSEngine] Poor accuracy: ${coords.accuracy}m, skipping`);
      return;
    }

    // Apply Kalman filter
    const filtered = this.kalmanFilter.update(
      coords.latitude,
      coords.longitude,
      coords.accuracy,
    );

    // Update state
    this.previousLocation = this.currentLocation;
    this.currentLocation = {
      latitude: filtered.latitude,
      longitude: filtered.longitude,
      altitude: coords.altitude,
      accuracy: coords.accuracy,
      timestamp: location.timestamp,
    };

    // Calculate speed and movement state
    this.updateMovementState();

    // Adjust polling based on movement
    this.adjustPollingRate();

    // Reset idle timeout
    this.resetIdleTimeout();

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Calculate speed and update movement state
   */
  updateMovementState() {
    if (!this.previousLocation || !this.currentLocation) {
      return;
    }

    const distance = haversineDistance(
      this.previousLocation.latitude,
      this.previousLocation.longitude,
      this.currentLocation.latitude,
      this.currentLocation.longitude,
    );

    const timeDelta =
      (this.currentLocation.timestamp - this.previousLocation.timestamp) / 1000;

    if (timeDelta > 0) {
      this.speed = distance / timeDelta;
    }

    // Update movement state
    if (this.speed < this.stillThreshold) {
      this.movementState = "still";
    } else if (this.speed < this.walkingThreshold) {
      this.movementState = "walking";
    } else {
      this.movementState = "riding";
    }
  }

  /**
   * Adjust polling rate based on movement
   */
  adjustPollingRate() {
    let newInterval;

    if (this.isBackground) {
      // Much slower in background
      newInterval = 10000; // 10 seconds
    } else if (this.movementState === "still") {
      newInterval = 2000; // 0.5 Hz when still
    } else if (this.movementState === "walking") {
      newInterval = 1000; // 1 Hz when walking
    } else {
      newInterval = 500; // 2 Hz when riding
    }

    if (newInterval !== this.pollingInterval) {
      this.pollingInterval = newInterval;
      // Restart subscription with new interval
      this.restart();
    }
  }

  /**
   * Restart GPS subscription
   */
  async restart() {
    this.stop();
    await this.start();
  }

  /**
   * Reset idle timeout
   */
  resetIdleTimeout() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }

    this.idleTimeout = setTimeout(() => {
      console.log("[GPSEngine] Idle timeout - reducing polling");
      this.pollingInterval = 5000; // 0.2 Hz when idle
      this.restart();
    }, this.idleDelay);
  }

  /**
   * Set background mode
   */
  setBackgroundMode(isBackground) {
    this.isBackground = isBackground;
    this.adjustPollingRate();
  }

  /**
   * Subscribe to location updates
   */
  subscribe(callback) {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    const data = {
      location: this.currentLocation,
      movementState: this.movementState,
      speed: this.speed,
    };

    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("[GPSEngine] Listener error:", error);
      }
    });
  }

  /**
   * Get current location
   */
  getLocation() {
    return this.currentLocation;
  }

  /**
   * Get movement state
   */
  getMovementState() {
    return {
      state: this.movementState,
      speed: this.speed,
    };
  }
}

// Singleton instance
export const gpsEngine = new GPSEngine();

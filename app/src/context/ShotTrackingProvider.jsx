/** @format */

import React, { createContext, useContext, useState } from "react";
import {
  haversineDistance,
  calculateDispersion,
} from "../services/gps/distanceUtils";
import { useGPS } from "./GPSProvider";

const ShotTrackingContext = createContext(null);

export function ShotTrackingProvider({ children }) {
  const { location } = useGPS();
  const [isTracking, setIsTracking] = useState(false);
  const [shotStart, setShotStart] = useState(null);
  const [shots, setShots] = useState([]);

  /**
   * Start tracking a shot
   */
  const startShot = (clubId = null) => {
    if (!location) {
      throw new Error("No GPS location available");
    }

    if (location.accuracy > 15) {
      throw new Error(
        `GPS accuracy too poor: ${location.accuracy.toFixed(1)}m`,
      );
    }

    setShotStart({
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude || 0,
      },
      timestamp: Date.now(),
      clubId,
      accuracy: location.accuracy,
    });

    setIsTracking(true);
    console.log("[ShotTracking] Shot started");
  };

  /**
   * End tracking and compute shot metrics
   */
  const endShot = (targetLocation = null) => {
    if (!isTracking || !shotStart || !location) {
      throw new Error("No shot in progress");
    }

    if (location.accuracy > 15) {
      throw new Error(
        `GPS accuracy too poor: ${location.accuracy.toFixed(1)}m`,
      );
    }

    const shotEnd = {
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: location.altitude || 0,
    };

    // Calculate metrics
    const carryDistance = haversineDistance(
      shotStart.location.latitude,
      shotStart.location.longitude,
      shotEnd.latitude,
      shotEnd.longitude,
    );

    // Reject shots that are too short
    if (carryDistance < 5) {
      cancelShot();
      throw new Error("Shot too short (< 5 yards)");
    }

    const elevationChange = shotEnd.altitude - shotStart.location.altitude;

    // Calculate dispersion if target provided
    let dispersion = null;
    if (targetLocation) {
      dispersion = calculateDispersion(
        shotStart.location,
        shotEnd,
        targetLocation,
      );
    }

    const shot = {
      id: `shot_${Date.now()}`,
      clubId: shotStart.clubId,
      startLocation: shotStart.location,
      endLocation: shotEnd,
      carryDistance,
      totalDistance: carryDistance, // Would need roll tracking for real total
      elevationChange,
      dispersion,
      startTimestamp: shotStart.timestamp,
      endTimestamp: Date.now(),
      startAccuracy: shotStart.accuracy,
      endAccuracy: location.accuracy,
    };

    setShots((prev) => [...prev, shot]);
    setShotStart(null);
    setIsTracking(false);

    console.log("[ShotTracking] Shot completed:", shot);
    return shot;
  };

  /**
   * Cancel current shot
   */
  const cancelShot = () => {
    setShotStart(null);
    setIsTracking(false);
    console.log("[ShotTracking] Shot cancelled");
  };

  /**
   * Clear all shots
   */
  const clearShots = () => {
    setShots([]);
  };

  /**
   * Get shots for a specific club
   */
  const getShotsByClub = (clubId) => {
    return shots.filter((shot) => shot.clubId === clubId);
  };

  const value = {
    isTracking,
    shotStart,
    shots,
    startShot,
    endShot,
    cancelShot,
    clearShots,
    getShotsByClub,
  };

  return (
    <ShotTrackingContext.Provider value={value}>
      {children}
    </ShotTrackingContext.Provider>
  );
}

export function useShotTracking() {
  const context = useContext(ShotTrackingContext);
  if (!context) {
    throw new Error("useShotTracking must be used within ShotTrackingProvider");
  }
  return context;
}

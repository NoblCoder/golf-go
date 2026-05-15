/** @format */

import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";
import { gpsEngine } from "../services/gps/GPSEngine";

const GPSContext = createContext(null);

export function GPSProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [movementState, setMovementState] = useState("still");
  const [speed, setSpeed] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    async function init() {
      try {
        await gpsEngine.start();
        setIsReady(true);

        // Subscribe to GPS updates
        unsubscribe = gpsEngine.subscribe((data) => {
          setLocation(data.location);
          setMovementState(data.movementState);
          setSpeed(data.speed);
        });
      } catch (err) {
        console.error("[GPSProvider] Failed to start GPS:", err);
        setError(err.message);
      }
    }

    init();

    // Handle app state changes
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (nextAppState === "active") {
          gpsEngine.setBackgroundMode(false);
        } else if (nextAppState === "background") {
          gpsEngine.setBackgroundMode(true);
        }
      },
    );

    return () => {
      if (unsubscribe) unsubscribe();
      gpsEngine.stop();
      appStateSubscription.remove();
    };
  }, []);

  const value = {
    location,
    movementState,
    speed,
    isReady,
    error,
  };

  return <GPSContext.Provider value={value}>{children}</GPSContext.Provider>;
}

export function useGPS() {
  const context = useContext(GPSContext);
  if (!context) {
    throw new Error("useGPS must be used within GPSProvider");
  }
  return context;
}

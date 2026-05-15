/** @format */

import { haversineDistance, isPointInPolygon } from "./gps/distanceUtils";

/**
 * Auto hole detection with polygon-based logic
 */
export class HoleDetectionEngine {
  constructor() {
    this.currentHole = null;
    this.holeHistory = []; // Last 5 GPS points with hole assignments
    this.isLockedInFairway = false;
    this.consecutivePoints = 0;
    this.requiredConsecutivePoints = 3;
  }

  /**
   * Update current position and detect hole changes
   * @param {Object} position - Current GPS position
   * @param {Array} holes - Array of hole objects with polygons
   * @returns {Object|null} New hole if changed, null otherwise
   */
  update(position, holes) {
    if (!position || !holes || holes.length === 0) {
      return null;
    }

    // Check each hole's polygons
    for (const hole of holes) {
      // Check tee box
      if (
        hole.teeBoxPolygon &&
        isPointInPolygon(position, hole.teeBoxPolygon)
      ) {
        return this.handleTeeBoxEntry(hole);
      }

      // Check fairway (locks the hole)
      if (
        hole.fairwayPolygon &&
        isPointInPolygon(position, hole.fairwayPolygon)
      ) {
        return this.handleFairwayEntry(hole);
      }

      // Check green (completes the hole)
      if (hole.greenPolygon && isPointInPolygon(position, hole.greenPolygon)) {
        return this.handleGreenEntry(hole);
      }
    }

    // Fallback: nearest tee box within range
    if (!this.currentHole || !this.isLockedInFairway) {
      const nearestHole = this.findNearestTeeBox(position, holes);
      if (nearestHole) {
        return this.setCurrentHole(nearestHole);
      }
    }

    return null;
  }

  /**
   * Handle entering a tee box
   */
  handleTeeBoxEntry(hole) {
    // Only switch if we're not locked in a fairway
    if (this.isLockedInFairway && this.currentHole?.number !== hole.number) {
      // Entering next hole's tee box means we completed previous hole
      this.markHoleComplete();
    }

    this.consecutivePoints++;

    if (this.consecutivePoints >= this.requiredConsecutivePoints) {
      return this.setCurrentHole(hole);
    }

    return null;
  }

  /**
   * Handle entering fairway - locks the hole
   */
  handleFairwayEntry(hole) {
    if (!this.isLockedInFairway) {
      this.isLockedInFairway = true;
      console.log(`[HoleDetection] Locked on hole ${hole.number}`);
    }

    if (this.currentHole?.number !== hole.number) {
      return this.setCurrentHole(hole);
    }

    return null;
  }

  /**
   * Handle entering green
   */
  handleGreenEntry(hole) {
    if (this.currentHole?.number === hole.number) {
      this.consecutivePoints++;

      if (this.consecutivePoints >= this.requiredConsecutivePoints) {
        this.markHoleComplete();
      }
    }
    return null;
  }

  /**
   * Find nearest tee box within acceptable range
   */
  findNearestTeeBox(position, holes) {
    const minDistance = 40; // meters (~44 yards)
    const maxDistance = 80; // meters (~87 yards)

    let nearest = null;
    let nearestDistance = Infinity;

    for (const hole of holes) {
      if (!hole.teeBoxPolygon || hole.teeBoxPolygon.length === 0) {
        continue;
      }

      // Use first point of tee box as reference
      const teePoint = hole.teeBoxPolygon[0];
      const distance = haversineDistance(
        position.latitude,
        position.longitude,
        teePoint.latitude,
        teePoint.longitude,
      );

      if (
        distance >= minDistance &&
        distance <= maxDistance &&
        distance < nearestDistance
      ) {
        nearest = hole;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  /**
   * Set current hole
   */
  setCurrentHole(hole) {
    if (this.currentHole?.number !== hole.number) {
      this.currentHole = hole;
      this.consecutivePoints = 0;
      this.isLockedInFairway = false;

      console.log(`[HoleDetection] Switched to hole ${hole.number}`);
      return hole;
    }
    return null;
  }

  /**
   * Mark hole as complete
   */
  markHoleComplete() {
    if (this.currentHole) {
      console.log(`[HoleDetection] Hole ${this.currentHole.number} complete`);
      this.currentHole = null;
      this.isLockedInFairway = false;
      this.consecutivePoints = 0;
    }
  }

  /**
   * Manually set hole (user override)
   */
  setHole(hole) {
    this.currentHole = hole;
    this.isLockedInFairway = false;
    this.consecutivePoints = this.requiredConsecutivePoints;
    console.log(`[HoleDetection] Manually set to hole ${hole.number}`);
  }

  /**
   * Get current hole
   */
  getCurrentHole() {
    return this.currentHole;
  }

  /**
   * Reset detection state
   */
  reset() {
    this.currentHole = null;
    this.holeHistory = [];
    this.isLockedInFairway = false;
    this.consecutivePoints = 0;
  }
}

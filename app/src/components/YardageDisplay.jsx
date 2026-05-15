/** @format */

import { View, Text, StyleSheet } from "react-native";
import { metersToYards } from "../services/gps/distanceUtils";

/**
 * Display front/center/back yardages to green
 */
export default function YardageDisplay({ distances, elevation = 0 }) {
  const formatYardage = (meters) => {
    if (meters === null || meters === undefined) return "--";
    return Math.round(metersToYards(meters));
  };

  const playsLike = (meters) => {
    if (meters === null || elevation === 0) return null;
    const adjusted = meters + elevation * 0.9;
    return Math.round(metersToYards(adjusted));
  };

  return (
    <View style={styles.container}>
      {/* Front */}
      <View style={styles.distanceBox}>
        <Text style={styles.label}>FRONT</Text>
        <Text style={styles.yardage}>{formatYardage(distances?.front)}</Text>
      </View>

      {/* Center - Featured */}
      <View style={[styles.distanceBox, styles.centerBox]}>
        <Text style={styles.label}>CENTER</Text>
        <Text style={styles.centerYardage}>
          {formatYardage(distances?.center)}
        </Text>
        {elevation !== 0 && distances?.center && (
          <Text style={styles.playsLike}>
            Plays {playsLike(distances.center)}
          </Text>
        )}
      </View>

      {/* Back */}
      <View style={styles.distanceBox}>
        <Text style={styles.label}>BACK</Text>
        <Text style={styles.yardage}>{formatYardage(distances?.back)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#0d2818",
    borderRadius: 12,
  },
  distanceBox: {
    alignItems: "center",
    flex: 1,
  },
  centerBox: {
    flex: 1.5,
    backgroundColor: "#1a472a",
    borderRadius: 12,
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a0d9b4",
    letterSpacing: 1,
    marginBottom: 4,
  },
  yardage: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  centerYardage: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  playsLike: {
    fontSize: 14,
    color: "#ffcc00",
    marginTop: 4,
  },
});

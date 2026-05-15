/** @format */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

/**
 * Hole navigation with prev/current/next
 */
export default function HoleNavigation({
  currentHole,
  totalHoles,
  onPrevious,
  onNext,
}) {
  const hasPrevious = currentHole > 1;
  const hasNext = currentHole < totalHoles;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.navButton, !hasPrevious && styles.disabledButton]}
        onPress={onPrevious}
        disabled={!hasPrevious}>
        <Text style={[styles.navText, !hasPrevious && styles.disabledText]}>
          ← Prev
        </Text>
      </TouchableOpacity>

      <View style={styles.currentHole}>
        <Text style={styles.holeLabel}>HOLE</Text>
        <Text style={styles.holeNumber}>{currentHole}</Text>
        <Text style={styles.totalHoles}>of {totalHoles}</Text>
      </View>

      <TouchableOpacity
        style={[styles.navButton, !hasNext && styles.disabledButton]}
        onPress={onNext}
        disabled={!hasNext}>
        <Text style={[styles.navText, !hasNext && styles.disabledText]}>
          Next →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a472a",
    borderRadius: 12,
    padding: 16,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#2d7a4a",
  },
  disabledButton: {
    backgroundColor: "#0d2818",
    opacity: 0.3,
  },
  navText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledText: {
    opacity: 0.5,
  },
  currentHole: {
    alignItems: "center",
  },
  holeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a0d9b4",
    letterSpacing: 1,
  },
  holeNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  totalHoles: {
    fontSize: 14,
    color: "#a0d9b4",
  },
});

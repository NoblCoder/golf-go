/** @format */

import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

/**
 * Shot tracking button with state management
 */
export default function ShotButton({
  isTracking,
  onStart,
  onEnd,
  onCancel,
  accuracy,
}) {
  const isAccuracyGood = accuracy && accuracy <= 15;

  if (isTracking) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.endButton} onPress={onEnd}>
          <Text style={styles.buttonText}>End Shot</Text>
          <Text style={styles.buttonSubtext}>Tap when ball stops</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.startButton, !isAccuracyGood && styles.disabledButton]}
        onPress={onStart}
        disabled={!isAccuracyGood}>
        <Text style={styles.buttonText}>Mark Shot</Text>
        <Text style={styles.buttonSubtext}>
          {isAccuracyGood
            ? `GPS: ${accuracy?.toFixed(1)}m`
            : "Waiting for GPS..."}
        </Text>
      </TouchableOpacity>

      {!isAccuracyGood && (
        <Text style={styles.warningText}>
          Poor GPS accuracy - move to open area
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
  },
  startButton: {
    backgroundColor: "#2d7a4a",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 200,
  },
  endButton: {
    backgroundColor: "#d4af37",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 200,
  },
  disabledButton: {
    backgroundColor: "#555",
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonSubtext: {
    color: "#fff",
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelText: {
    color: "#ff6347",
    fontSize: 16,
    fontWeight: "600",
  },
  warningText: {
    color: "#ffa07a",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});

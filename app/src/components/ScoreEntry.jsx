/** @format */

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

/**
 * Score entry with +/- buttons
 */
export default function ScoreEntry({ currentScore, par, onScoreChange }) {
  const increment = () => onScoreChange(currentScore + 1);
  const decrement = () => onScoreChange(Math.max(1, currentScore - 1));

  const getScoreColor = () => {
    const relative = currentScore - par;
    if (relative <= -2) return "#ffd700"; // Eagle or better
    if (relative === -1) return "#90ee90"; // Birdie
    if (relative === 0) return "#fff"; // Par
    if (relative === 1) return "#ffa07a"; // Bogey
    return "#ff6347"; // Double or worse
  };

  const getScoreText = () => {
    const relative = currentScore - par;
    if (relative <= -2) return "Eagle";
    if (relative === -1) return "Birdie";
    if (relative === 0) return "Par";
    if (relative === 1) return "Bogey";
    if (relative === 2) return "Double";
    return `+${relative}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>SCORE</Text>

      <View style={styles.scoreRow}>
        <TouchableOpacity style={styles.button} onPress={decrement}>
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>

        <View style={styles.scoreDisplay}>
          <Text style={[styles.score, { color: getScoreColor() }]}>
            {currentScore}
          </Text>
          <Text style={styles.scoreLabel}>{getScoreText()}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={increment}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.parLabel}>Par {par}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a472a",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a0d9b4",
    letterSpacing: 1,
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2d7a4a",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  scoreDisplay: {
    alignItems: "center",
    minWidth: 80,
  },
  score: {
    fontSize: 56,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 14,
    color: "#a0d9b4",
    marginTop: 4,
  },
  parLabel: {
    fontSize: 16,
    color: "#a0d9b4",
    marginTop: 12,
  },
});

/** @format */

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useGPS } from "../src/context/GPSProvider";
import { useShotTracking } from "../src/context/ShotTrackingProvider";
import {
  useCourse,
  useCreateRound,
  useUpdateHoleScore,
  useCompleteRound,
} from "../src/hooks/useAPI";
import { calculateGreenDistances } from "../src/services/gps/distanceUtils";
import YardageDisplay from "../src/components/YardageDisplay";
import ScoreEntry from "../src/components/ScoreEntry";
import ShotButton from "../src/components/ShotButton";
import HoleNavigation from "../src/components/HoleNavigation";

/**
 * Play Mode - Main scoring and rangefinder screen
 */
export default function PlayModeScreen() {
  const { courseId } = useLocalSearchParams();
  const { location, isReady: gpsReady } = useGPS();
  const { isTracking, startShot, endShot, cancelShot } = useShotTracking();

  // Fetch course data
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const createRound = useCreateRound();

  // Local state
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [roundId, setRoundId] = useState(null);
  const [scores, setScores] = useState({});
  const [roundCompleted, setRoundCompleted] = useState(false);

  const updateHoleScore = useUpdateHoleScore(roundId);
  const completeRound = useCompleteRound(roundId);

  // Initialize round - stable callback prevents duplicate creation
  const initRound = useCallback(() => {
    if (course && !roundId) {
      createRound.mutate(
        { courseId: course.id },
        {
          onSuccess: (data) => {
            setRoundId(data.id);
          },
        },
      );
    }
  }, [course, roundId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    initRound();
  }, [initRound]);

  if (courseLoading || !course) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#2d7a4a' />
        <Text style={styles.loadingText}>Loading course...</Text>
      </View>
    );
  }

  // Skip GPS check on web platform
  if (Platform.OS !== "web" && !gpsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#2d7a4a' />
        <Text style={styles.loadingText}>Acquiring GPS...</Text>
      </View>
    );
  }

  const currentHole = course.holes[currentHoleIndex];
  const currentScore = scores[currentHole.holeNumber] || currentHole.par;

  // Calculate distances to green
  const distances =
    location && currentHole.greenPolygon
      ? calculateGreenDistances(location, currentHole.greenPolygon)
      : null;

  const elevation =
    location && currentHole.greenElevation
      ? currentHole.greenElevation - (location.altitude || 0)
      : 0;

  const handleScoreChange = (newScore) => {
    setScores((prev) => ({ ...prev, [currentHole.holeNumber]: newScore }));

    if (roundId) {
      updateHoleScore.mutate({
        holeNumber: currentHole.holeNumber,
        score: newScore,
        putts: 0,
      });
    }
  };

  const handleCompleteRound = () => {
    if (!roundId) return;
    completeRound.mutate(undefined, {
      onSuccess: () => setRoundCompleted(true),
      onError: (error) => alert(error.message),
    });
  };

  const handleStartShot = () => {
    try {
      startShot();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEndShot = () => {
    try {
      endShot();
    } catch (error) {
      alert(error.message);
    }
  };

  const handlePrevHole = () => {
    if (currentHoleIndex > 0) {
      setCurrentHoleIndex((prev) => prev - 1);
    }
  };

  const handleNextHole = () => {
    if (currentHoleIndex < course.holes.length - 1) {
      setCurrentHoleIndex((prev) => prev + 1);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hole Info */}
      <View style={styles.holeInfo}>
        <Text style={styles.courseName}>{course.name}</Text>
        <Text style={styles.holeName}>
          {currentHole.name || `Hole ${currentHole.holeNumber}`}
        </Text>
      </View>

      {/* Hole Navigation */}
      <HoleNavigation
        currentHole={currentHole.holeNumber}
        totalHoles={course.holes.length}
        onPrevious={handlePrevHole}
        onNext={handleNextHole}
      />

      {/* Yardage Display */}
      <YardageDisplay distances={distances} elevation={elevation} />

      {/* Score Entry */}
      <ScoreEntry
        currentScore={currentScore}
        par={currentHole.par}
        onScoreChange={handleScoreChange}
      />

      {/* Shot Tracking */}
      <View style={styles.shotSection}>
        <Text style={styles.sectionLabel}>SHOT TRACKING</Text>
        <ShotButton
          isTracking={isTracking}
          onStart={handleStartShot}
          onEnd={handleEndShot}
          onCancel={cancelShot}
          accuracy={location?.accuracy}
        />
      </View>

      {/* Complete Round */}
      {roundId && !roundCompleted && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteRound}
          disabled={completeRound.isPending}>
          <Text style={styles.completeButtonText}>
            {completeRound.isPending ? "Saving..." : "Complete Round"}
          </Text>
        </TouchableOpacity>
      )}

      {roundCompleted && (
        <View style={styles.completedBanner}>
          <Text style={styles.completedText}>🏆 Round Complete!</Text>
        </View>
      )}

      {/* GPS Status */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          GPS: {location?.accuracy?.toFixed(1)}m
        </Text>
        <Text style={styles.statusText}>
          Alt: {location?.altitude?.toFixed(0)}m
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d2818",
  },
  content: {
    padding: 16,
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0d2818",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#a0d9b4",
    fontSize: 16,
    marginTop: 12,
  },
  holeInfo: {
    alignItems: "center",
    marginBottom: 8,
  },
  courseName: {
    color: "#a0d9b4",
    fontSize: 16,
    fontWeight: "600",
  },
  holeName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  shotSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a0d9b4",
    letterSpacing: 1,
    marginBottom: 16,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1a472a",
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  statusText: {
    color: "#a0d9b4",
    fontSize: 12,
    fontWeight: "600",
  },
  completeButton: {
    backgroundColor: "#1a472a",
    borderWidth: 2,
    borderColor: "#2d7a4a",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 4,
  },
  completeButtonText: {
    color: "#a0d9b4",
    fontSize: 16,
    fontWeight: "600",
  },
  completedBanner: {
    backgroundColor: "#2d7a4a",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  completedText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});

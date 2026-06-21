/** @format */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import * as Location from "expo-location";
import { useCourses } from "../src/hooks/useAPI";
import { formatDistance } from "../src/utils/distanceCalculator";

/**
 * Course selection screen
 */
export default function CoursesScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const { data: courses = [], isLoading } = useCourses(userLocation);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  async function requestLocationPermission() {
    try {
      setIsLoadingLocation(true);

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("Location permission denied");
        setIsLoadingLocation(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setIsLoadingLocation(false);
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError("Unable to get location");
      setIsLoadingLocation(false);
    }
  }

  if (isLoading || isLoadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#2d7a4a' />
        <Text style={styles.loadingText}>
          {isLoadingLocation
            ? "Getting your location..."
            : "Loading courses..."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Courses</Text>
        {locationError && (
          <Text style={styles.locationError}>📍 {locationError}</Text>
        )}
        {userLocation && (
          <Text style={styles.locationSuccess}>
            📍 Showing courses near you
          </Text>
        )}
      </View>

      {courses.map((course) => (
        <Link
          key={course.id}
          href={{
            pathname: "/play",
            params: { courseId: course.id },
          }}
          asChild>
          <TouchableOpacity style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <Text style={styles.courseName}>{course.name}</Text>
              {course.distance !== undefined && (
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>
                    {formatDistance(course.distance)}
                  </Text>
                </View>
              )}
            </View>
            {course.location && (
              <Text style={styles.courseDetails}>{course.location}</Text>
            )}
            <Text style={styles.courseHoles}>
              {course.holes?.length || 18} holes
              {course.par ? ` · Par ${course.par}` : ""}
            </Text>
          </TouchableOpacity>
        </Link>
      ))}

      {courses.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No courses available</Text>
          <Text style={styles.emptySubtext}>
            Add courses through the backend API
          </Text>
        </View>
      )}
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
    gap: 16,
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
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  locationError: {
    fontSize: 14,
    color: "#ff6b6b",
    marginTop: 4,
  },
  locationSuccess: {
    fontSize: 14,
    color: "#a0d9b4",
    marginTop: 4,
  },
  courseCard: {
    backgroundColor: "#1a472a",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: "#2d7a4a",
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  courseName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    marginRight: 12,
  },
  distanceBadge: {
    backgroundColor: "#2d7a4a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  courseDetails: {
    fontSize: 16,
    color: "#a0d9b4",
    marginBottom: 4,
  },
  courseHoles: {
    fontSize: 14,
    color: "#a0d9b4",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#666",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#666",
    fontSize: 14,
  },
});

/** @format */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { useCourses } from "../src/hooks/useAPI";

/**
 * Course selection screen
 */
export default function CoursesScreen() {
  const { data: courses = [], isLoading } = useCourses();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading courses...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Select a Course</Text>

      {courses.map((course) => (
        <Link
          key={course.id}
          href={{
            pathname: "/play",
            params: { courseId: course.id },
          }}
          asChild>
          <TouchableOpacity style={styles.courseCard}>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseDetails}>
              {course.city}, {course.state}
            </Text>
            <Text style={styles.courseHoles}>
              {course.holes?.length || 18} holes
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  courseCard: {
    backgroundColor: "#1a472a",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: "#2d7a4a",
  },
  courseName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
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

/** @format */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useGPS } from "../src/context/GPSProvider";
import { useShotTracking } from "../src/context/ShotTrackingProvider";
import { useClubs, useCreateClub, useClubAnalytics } from "../src/hooks/useAPI";
import { metersToYards } from "../src/services/gps/distanceUtils";
import { DEMO_USER_ID } from "../src/constants";
import ShotButton from "../src/components/ShotButton";

/**
 * Practice Mode - Club distance tracking and analytics
 */
export default function PracticeModeScreen() {
  const { location, isReady: gpsReady } = useGPS();
  const { isTracking, startShot, endShot, cancelShot, shots } =
    useShotTracking();
  const { data: clubs = [], isLoading: clubsLoading } = useClubs();
  const createClub = useCreateClub();

  const [selectedClubId, setSelectedClubId] = useState(null);
  const [showAddClub, setShowAddClub] = useState(false);
  const [newClubName, setNewClubName] = useState("");
  const [newClubType, setNewClubType] = useState("iron");

  const CLUB_TYPES = [
    { value: "driver", label: "Driver" },
    { value: "wood", label: "Wood" },
    { value: "hybrid", label: "Hybrid" },
    { value: "iron", label: "Iron" },
    { value: "wedge", label: "Wedge" },
    { value: "putter", label: "Putter" },
  ];

  const handleAddClub = () => {
    if (newClubName.trim()) {
      createClub.mutate(
        { name: newClubName.trim(), type: newClubType, userId: DEMO_USER_ID },
        {
          onSuccess: () => {
            setNewClubName("");
            setNewClubType("iron");
            setShowAddClub(false);
          },
        },
      );
    }
  };

  const handleStartShot = () => {
    if (!selectedClubId) {
      alert("Please select a club first");
      return;
    }

    try {
      startShot(selectedClubId);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEndShot = () => {
    try {
      const shot = endShot();
      alert(
        `Shot recorded: ${Math.round(metersToYards(shot.carryDistance))} yards`,
      );
    } catch (error) {
      alert(error.message);
    }
  };

  // Calculate stats for selected club
  const clubShots = selectedClubId
    ? shots.filter((s) => s.clubId === selectedClubId)
    : [];

  const avgDistance =
    clubShots.length > 0
      ? clubShots.reduce((sum, s) => sum + s.carryDistance, 0) /
        clubShots.length
      : 0;

  // Skip GPS check on web platform
  if (Platform.OS !== "web" && !gpsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#2d7a4a' />
        <Text style={styles.loadingText}>Acquiring GPS...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Club Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SELECT CLUB</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.clubList}>
          {clubs.map((club) => (
            <TouchableOpacity
              key={club.id}
              style={[
                styles.clubButton,
                selectedClubId === club.id && styles.clubButtonActive,
              ]}
              onPress={() => setSelectedClubId(club.id)}>
              <Text
                style={[
                  styles.clubButtonText,
                  selectedClubId === club.id && styles.clubButtonTextActive,
                ]}>
                {club.name}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.addClubButton}
            onPress={() => setShowAddClub(true)}>
            <Text style={styles.addClubText}>+ Add</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Shot Statistics */}
      {selectedClubId && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>
            {clubs.find((c) => c.id === selectedClubId)?.name}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>AVG DISTANCE</Text>
              <Text style={styles.statValue}>
                {Math.round(metersToYards(avgDistance))}
              </Text>
              <Text style={styles.statUnit}>yards</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>SHOTS</Text>
              <Text style={styles.statValue}>{clubShots.length}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Shot Tracking */}
      <View style={styles.shotSection}>
        <ShotButton
          isTracking={isTracking}
          onStart={handleStartShot}
          onEnd={handleEndShot}
          onCancel={cancelShot}
          accuracy={location?.accuracy}
        />
      </View>

      {/* Recent Shots */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RECENT SHOTS</Text>
        {shots
          .slice(-5)
          .reverse()
          .map((shot) => {
            const club = clubs.find((c) => c.id === shot.clubId);
            return (
              <View key={shot.id} style={styles.shotCard}>
                <Text style={styles.shotClub}>{club?.name || "Unknown"}</Text>
                <Text style={styles.shotDistance}>
                  {Math.round(metersToYards(shot.carryDistance))} yards
                </Text>
              </View>
            );
          })}
        {shots.length === 0 && (
          <Text style={styles.emptyText}>No shots recorded yet</Text>
        )}
      </View>

      {/* GPS Status */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          GPS: {location?.accuracy?.toFixed(1)}m
        </Text>
      </View>

      {/* Add Club Modal */}
      <Modal
        visible={showAddClub}
        transparent
        animationType='fade'
        onRequestClose={() => setShowAddClub(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Club</Text>
            <TextInput
              style={styles.input}
              placeholder='Club name (e.g., 7 Iron)'
              placeholderTextColor='#888'
              value={newClubName}
              onChangeText={setNewClubName}
              autoFocus
            />
            <Text style={styles.typeLabel}>TYPE</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.typeList}>
              {CLUB_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.typeButton,
                    newClubType === t.value && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewClubType(t.value)}>
                  <Text
                    style={[
                      styles.typeButtonText,
                      newClubType === t.value && styles.typeButtonTextActive,
                    ]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowAddClub(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAddClub}>
                <Text style={styles.modalButtonTextPrimary}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a0d9b4",
    letterSpacing: 1,
  },
  clubList: {
    gap: 12,
    paddingVertical: 4,
  },
  clubButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#1a472a",
    borderWidth: 2,
    borderColor: "#1a472a",
  },
  clubButtonActive: {
    backgroundColor: "#2d7a4a",
    borderColor: "#4a9d6a",
  },
  clubButtonText: {
    color: "#a0d9b4",
    fontSize: 16,
    fontWeight: "600",
  },
  clubButtonTextActive: {
    color: "#fff",
  },
  addClubButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#1a472a",
    borderWidth: 2,
    borderColor: "#2d7a4a",
    borderStyle: "dashed",
  },
  addClubText: {
    color: "#2d7a4a",
    fontSize: 16,
    fontWeight: "600",
  },
  statsCard: {
    backgroundColor: "#1a472a",
    borderRadius: 12,
    padding: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a0d9b4",
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  statUnit: {
    fontSize: 14,
    color: "#a0d9b4",
    marginTop: 4,
  },
  shotSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  shotCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a472a",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  shotClub: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  shotDistance: {
    color: "#a0d9b4",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 20,
  },
  statusBar: {
    backgroundColor: "#1a472a",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  statusText: {
    color: "#a0d9b4",
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1a472a",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#0d2818",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#0d2818",
  },
  modalButtonPrimary: {
    backgroundColor: "#2d7a4a",
  },
  modalButtonText: {
    color: "#a0d9b4",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonTextPrimary: {
    color: "#fff",
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#a0d9b4",
    letterSpacing: 1,
    marginBottom: 8,
  },
  typeList: {
    gap: 8,
    paddingBottom: 16,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#0d2818",
    borderWidth: 1,
    borderColor: "#2d7a4a",
  },
  typeButtonActive: {
    backgroundColor: "#2d7a4a",
  },
  typeButtonText: {
    color: "#a0d9b4",
    fontSize: 14,
    fontWeight: "600",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
});

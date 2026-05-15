/** @format */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Configure base URL from environment
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// ============================================================================
// COURSES
// ============================================================================

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await api.get("/courses");
      return data;
    },
  });
}

export function useCourse(courseId) {
  return useQuery({
    queryKey: ["courses", courseId],
    queryFn: async () => {
      const { data } = await api.get(`/courses/${courseId}`);
      return data;
    },
    enabled: !!courseId,
  });
}

// ============================================================================
// ROUNDS
// ============================================================================

export function useRounds(limit = 20) {
  return useQuery({
    queryKey: ["rounds", { limit }],
    queryFn: async () => {
      const { data } = await api.get("/rounds", { params: { limit } });
      return data;
    },
  });
}

export function useRound(roundId) {
  return useQuery({
    queryKey: ["rounds", roundId],
    queryFn: async () => {
      const { data } = await api.get(`/rounds/${roundId}`);
      return data;
    },
    enabled: !!roundId,
  });
}

export function useCreateRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, userId = 1 }) => {
      const { data } = await api.post("/rounds", { courseId, userId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rounds"] });
    },
  });
}

export function useUpdateHoleScore(roundId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ holeNumber, strokes, putts }) => {
      const { data } = await api.put(`/rounds/${roundId}/holes/${holeNumber}`, {
        strokes,
        putts,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rounds", roundId] });
    },
  });
}

export function useCompleteRound(roundId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/rounds/${roundId}/complete`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rounds"] });
      queryClient.invalidateQueries({ queryKey: ["rounds", roundId] });
    },
  });
}

// ============================================================================
// SHOTS
// ============================================================================

export function useShotsByRound(roundId) {
  return useQuery({
    queryKey: ["shots", "round", roundId],
    queryFn: async () => {
      const { data } = await api.get("/shots", { params: { roundId } });
      return data;
    },
    enabled: !!roundId,
  });
}

export function useShotsByClub(clubId) {
  return useQuery({
    queryKey: ["shots", "club", clubId],
    queryFn: async () => {
      const { data } = await api.get("/shots", { params: { clubId } });
      return data;
    },
    enabled: !!clubId,
  });
}

export function useCreateShot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shotData) => {
      const { data } = await api.post("/shots", shotData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shots"] });
      if (data.clubId) {
        queryClient.invalidateQueries({
          queryKey: ["clubs", data.clubId, "analytics"],
        });
      }
    },
  });
}

export function useDeleteShot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shotId) => {
      await api.delete(`/shots/${shotId}`);
      return shotId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shots"] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
}

// ============================================================================
// CLUBS
// ============================================================================

export function useClubs() {
  return useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const { data } = await api.get("/clubs");
      return data;
    },
  });
}

export function useCreateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clubData) => {
      const { data } = await api.post("/clubs", clubData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
}

export function useUpdateClub(clubId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates) => {
      const { data } = await api.put(`/clubs/${clubId}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
}

export function useDeleteClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clubId) => {
      await api.delete(`/clubs/${clubId}`);
      return clubId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
}

export function useClubAnalytics(clubId) {
  return useQuery({
    queryKey: ["clubs", clubId, "analytics"],
    queryFn: async () => {
      const { data } = await api.get(`/clubs/${clubId}/analytics`);
      return data;
    },
    enabled: !!clubId,
  });
}

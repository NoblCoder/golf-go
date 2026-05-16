/** @format */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { GPSProvider } from "../src/context/GPSProvider";
import { ShotTrackingProvider } from "../src/context/ShotTrackingProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Wrapper component for all providers
function AppProviders({ children }) {
  return (
    <GPSProvider>
      <ShotTrackingProvider>{children}</ShotTrackingProvider>
    </GPSProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#1a472a" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}>
          <Stack.Screen name='index' options={{ title: "Golf Go" }} />
          <Stack.Screen name='play' options={{ title: "Play Mode" }} />
          <Stack.Screen name='practice' options={{ title: "Practice Mode" }} />
          <Stack.Screen name='courses' options={{ title: "Courses" }} />
        </Stack>
      </AppProviders>
    </QueryClientProvider>
  );
}

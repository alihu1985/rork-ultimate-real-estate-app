import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View, StyleSheet } from "react-native";

import { PropertyContext } from "@/contexts/PropertyContext";
import { AuthContext, useAuth } from "@/contexts/AuthContext";
import { CurrencyContext } from "@/contexts/CurrencyContext";
import Colors from "@/constants/Colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';

    if (!isAuthenticated && !inAuthGroup) {
      setTimeout(() => {
        router.replace('/login');
      }, 100);
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "رجوع" }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerTitle: "إنشاء حساب", headerBackTitle: "رجوع" }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="property/[id]" 
        options={{ 
          headerShown: false,
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="filters" 
        options={{ 
          presentation: "modal",
          headerTitle: "البحث والفلاتر",
          headerBackTitle: "إغلاق",
        }} 
      />
      <Stack.Screen 
        name="favorites" 
        options={{ 
          headerTitle: "المفضلة",
          headerBackTitle: "رجوع",
        }} 
      />
      <Stack.Screen 
        name="add-property" 
        options={{ 
          headerTitle: "إضافة عقار",
          headerBackTitle: "رجوع",
        }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          headerTitle: "الملف الشخصي",
          headerBackTitle: "رجوع",
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext>
        <CurrencyContext>
          <PropertyContext>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </PropertyContext>
        </CurrencyContext>
      </AuthContext>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

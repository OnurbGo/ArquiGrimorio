import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const AUTH_KEY = "authToken";

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      return !!window.localStorage.getItem(AUTH_KEY);
    }
    const token = await AsyncStorage.getItem(AUTH_KEY);
    return !!token;
  } catch (err) {
    console.warn("isAuthenticated error:", err);
    return false;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      return window.localStorage.getItem(AUTH_KEY);
    }
    return await AsyncStorage.getItem(AUTH_KEY);
  } catch (err) {
    console.warn("getAuthToken error:", err);
    return null;
  }
};

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_KEY, token);
      return;
    }
    await AsyncStorage.setItem(AUTH_KEY, token);
  } catch (err) {
    console.warn("setAuthToken error:", err);
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_KEY);
      return;
    }
    await AsyncStorage.removeItem(AUTH_KEY);
  } catch (err) {
    console.warn("removeAuthToken error:", err);
  }
};

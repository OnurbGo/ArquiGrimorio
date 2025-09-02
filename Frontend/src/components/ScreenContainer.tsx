import React from "react";
import { ScrollView, StyleSheet } from "react-native";

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: object;
}

export default function ScreenContainer({
  children,
  style,
}: ScreenContainerProps) {
  return (
    <ScrollView contentContainerStyle={[styles.container, style]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
});

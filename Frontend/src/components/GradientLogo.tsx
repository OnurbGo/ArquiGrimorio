import { StyleSheet, Text } from "react-native";

export default function GradientLogo({ style }: { style?: any }) {
  return <Text style={[styles.logoText, style]}>Arquigrimório</Text>;
}

const styles = StyleSheet.create({
  logoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#a78bfa",
  },
});

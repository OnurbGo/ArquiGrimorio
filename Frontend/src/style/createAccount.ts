import { Dimensions, Platform, StyleSheet } from "react-native";

const WIN = Dimensions.get("window");
const CAP_WIDTH = Math.min(WIN.width, 1200); // cap vw for web
export const vw = CAP_WIDTH / 100;
export const vh = WIN.height / 100;
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const THEME = {
  bg: "#0b1220",
  text: "#e6eef8",
  muted: "#9ca3af",
  accent: "#7c5cff",
  danger: "#ef4444",
  success: "#22c55e",
};


export const stylesSafe = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
});

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center", // center horizontally
    justifyContent: "center",
    paddingVertical: clamp(4 * vh, 24, 48),
    paddingHorizontal: clamp(4 * vw, 12, 40),
  },
  header: {
    alignItems: "center",
    marginBottom: clamp(2 * vh, 12, 28),
  },
  title: {
    fontSize: clamp(6 * vw, 20, 54),
    fontWeight: "900",
    color: THEME.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: clamp(2 * vw, 12, 18),
    color: THEME.muted,
    textAlign: "center",
  },
  cardLight: {
    width: "100%",
    maxWidth: 720,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: clamp(2.2 * vw, 14, 28),
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  label: {
    fontSize: clamp(1.8 * vw, 13, 18),
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 6,
    marginTop: 8,
  },
  inputLight: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 10,
    padding: 12,
    fontSize: clamp(1.8 * vw, 14, 18),
    color: THEME.text,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  eyeBtn: {
    position: "absolute",
    right: 8,
    top: Platform.OS === "web" ? 10 : 12,
    padding: 6,
  },
  passwordStrength: {
    fontSize: clamp(1.6 * vw, 12, 16),
    marginTop: 6,
    fontWeight: "700",
  },
  passwordWeak: { color: THEME.danger },
  passwordStrong: { color: THEME.success },
  error: {
    color: THEME.danger,
    fontSize: clamp(1.6 * vw, 12, 16),
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  btn: {
    backgroundColor: THEME.accent,
    borderRadius: 10,
    paddingVertical: clamp(1.6 * vh, 10, 16),
    alignItems: "center",
    marginTop: 12,
  },
  success: {
    color: THEME.success,
    fontSize: clamp(1.6 * vw, 12, 16),
    marginTop: 10,
    textAlign: "center",
    fontWeight: "700",
  },
  errorAlert: {
    color: THEME.danger,
    fontSize: clamp(1.6 * vw, 12, 16),
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
    fontWeight: "700",
  },
});
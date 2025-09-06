import { Dimensions, StyleSheet } from "react-native";

const WIN = Dimensions.get("window");
const CAP_WIDTH = Math.min(WIN.width, 1200); // cap vw so it doesn't explode on large web screens
const vw = CAP_WIDTH / 100;
const vh = WIN.height / 100;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const THEME = {
  bg: "#0b1220",
  card: "#071525",
  muted: "#9ca3af",
  text: "#e6eef8",
  accent: "#7c5cff",
  danger: "#fb7185",
};

export const stylesSafe = {
  safeArea: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  keyboard: {
    flex: 1,
  },
} as const;

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // center everything horizontally
    paddingHorizontal: 4 * vw,
    paddingVertical: 4 * vh,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  // title uses vw but clamped so it won't be tiny on mobile or giant on web
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
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: THEME.card,
    padding: clamp(2.2 * vw, 14, 28),
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  label: {
    fontSize: clamp(1.6 * vw, 12, 18),
    color: THEME.text,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    color: THEME.text,
    backgroundColor: "rgba(255,255,255,0.02)",
    fontSize: clamp(1.6 * vw, 14, 18),
  },
  eyeBtn: {
    position: "absolute",
    right: 8,
    top: 12,
    padding: 6,
  },
  error: {
    marginTop: 10,
    color: THEME.danger,
    textAlign: "center",
    fontWeight: "600",
  },
  footer: {
    marginTop: 18,
    alignItems: "center",
  },
  footText: {
    fontSize: clamp(1.6 * vw, 12, 16),
    color: THEME.muted,
  },
  link: {
    color: THEME.accent,
    textDecorationLine: "underline",
    fontWeight: "700",
  },
});
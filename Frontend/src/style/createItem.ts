import { Dimensions, Platform, StyleSheet } from "react-native";

const WIN = Dimensions.get("window");

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  flex: { flex: 1 },
  scrollContent: { padding: 20, alignItems: "center", paddingBottom: 48 },
  card: {
    width: Math.min(760, WIN.width - 32),
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "rgba(109,40,217,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: { color: "#6d28d9", fontWeight: "800", fontSize: 20 },
  titleWrap: { flex: 1 },
  title: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  subtitle: { marginTop: 4, color: "#6b7280" },

  field: { width: "100%", marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "700", color: "#0f172a", marginBottom: 6 },
  input: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "web" ? 10 : 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eef2ff",
    color: "#0f172a",
  },
  textarea: { minHeight: 120, textAlignVertical: "top" as const },

  row: { flexDirection: "row", width: "100%" },
  col: { flex: 1 },

  pickerWrap: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eef2ff",
    backgroundColor: "#fbfbff",
  },

  preview: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eef2ff",
    backgroundColor: "#f1f5f9",
  },
  previewImage: { width: "100%", height: 180, resizeMode: "cover" },

  chartLikeWrap: { marginTop: 10, alignItems: "center" },

  // buttons: rely on Button component but add spacing helpers
  smallText: { fontSize: 12 },

  extra: { marginTop: 12 },
});
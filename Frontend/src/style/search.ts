import { Platform, StyleSheet, Dimensions} from "react-native";

const WIN = Dimensions.get("window");
export const CAP_WIDTH = Math.min(WIN.width, 1200); // cap to avoid huge vw on desktop
const baseVw = CAP_WIDTH / 100;
export const baseVh = WIN.height / 100;
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

// grid config
export const HORIZONTAL_PADDING = 32; // container left+right padding (16 + 16)
export const GAP = 12; // gap between cards (px)
export const MIN_CARD_WIDTH = 160; // minimal card width to try to fit 4 in row on wider screens
export const MAX_COLUMNS = 4;

export const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: clamp(2 * baseVh, 12, 24) },
  title: {
    fontSize: clamp(3.6 * baseVw, 20, 32),
    fontWeight: "800",
  },
  subtitle: { color: "#64748b", marginTop: 6 },

  filtersCard: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: clamp(1.6 * baseVw, 12, 18),
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
    // drop shadow (subtle)
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  filtersRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  filtersColumn: {
    flexDirection: "column",
  },

  inputWrap: { marginBottom: 8 },
  label: { fontWeight: "700", marginBottom: 6, color: "#0f172a" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
  },

  input: {
    flex: 1,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
    fontSize: clamp(1.6 * baseVw, 14, 16),
    color: "#0f172a",
  },

  pickerWrap: { marginBottom: 8 },
  pickerBox: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: Platform.OS === "web" ? 6 : 0,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: "relative",
    minHeight: 42,
  },
  pickerCaret: {
    position: "absolute",
    right: 10,
    top: Platform.OS === "android" ? 10 : 12,
    fontSize: 16,
    color: "#64748b",
    pointerEvents: "none",
  },

  clearWrap: {
    marginTop: Platform.OS === "web" ? 0 : 8,
    marginLeft: "auto",
    alignSelf: "center",
  },

  center: { alignItems: "center", padding: 24 },
  empty: { alignItems: "center", padding: 24 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { color: "#64748b", marginBottom: 12 },

  error: { color: "red", marginBottom: 12 },

  listContent: {
    paddingBottom: 40,
    paddingTop: 6,
  },
  itemWrapper: {
    paddingVertical: 8,
  },

  filterBox: {
    backgroundColor: "#f7fafc",
    borderRadius: 8,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
    marginBottom: 8,
  },
});

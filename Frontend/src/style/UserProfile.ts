import { StyleSheet, Dimensions } from "react-native";

export const WIN = Dimensions.get("window");
export const HORIZONTAL_PADDING = 32; // container padding left+right (16 each)
export const GAP = 12; // gap between cards
export const MIN_CARD_WIDTH = 160;

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f7fafc" },
  loadingRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7fafc",
  },
  container: { flex: 1, padding: 16 },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.06)",
    marginBottom: 12,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  avatarWrap: { marginRight: 12 },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "#6d28d9",
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e9d5ff",
  },
  avatarInitials: { fontSize: 28, fontWeight: "800", color: "#6d28d9" },

  headerInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  roleBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  roleBadgeText: { color: "#4f46e5", fontWeight: "700" },
  userDescription: { marginTop: 8, color: "#6b7280" },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 14,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statIcon: { fontSize: 18 },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 6,
  },
  statLabel: { color: "#6b7280", marginTop: 4 },

  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemsTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  itemsCount: { color: "#6b7280" },

  listContent: { paddingBottom: 36 },
  columnWrapper: { justifyContent: "space-between", paddingBottom: 12 },

  // itemWrap width is injected inline (calculated), keep marginBottom for vertical spacing
  itemWrap: { marginBottom: 12 },

  emptyBox: { alignItems: "center", padding: 32 },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { color: "#6b7280", textAlign: "center" },

  centerFull: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  errorTitle: { color: "#ef4444", fontWeight: "800", marginBottom: 8 },
});
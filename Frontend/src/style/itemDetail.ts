import { StyleSheet, Dimensions } from "react-native";

export const WIN = Dimensions.get("window");

export const styles = StyleSheet.create({
  containerRoot: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: { padding: 16, paddingBottom: 36, backgroundColor: "#fff" },

  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  errorText: { color: "#ef4444", fontWeight: "700", marginBottom: 8 },
  backButton: {
    marginTop: 8,
    backgroundColor: "#eef2ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: { color: "#4f46e5", fontWeight: "600" },

  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eef2ff",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    marginBottom: 16,
  },

  imageWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
  },
  heroImagePlaceholder: { alignItems: "center", justifyContent: "center" },

  overlayLike: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  overlayLikeDisabled: { opacity: 0.6 },
  overlayLikeText: { fontWeight: "800", color: "#374151" },
  overlayLikeTextActive: { color: "#9f1239" },

  itemTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 12,
    textAlign: "center",
  },

  badgesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  badge: {
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginHorizontal: 6,
  },
  badgeText: { color: "#4f46e5", fontWeight: "700" },
  badgeOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e6e6f6",
  },
  badgeOutlineText: { color: "#374151" },

  description: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 12,
    lineHeight: 20,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#fbfbff",
    alignItems: "center",
  },
  statLabel: { color: "#6b7280", fontSize: 12 },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 6,
  },

  // creator + chart row
  creatorChartRow: {
    marginTop: 16,
    flexDirection: WIN.width > 700 ? "row" : "column",
    gap: 12,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  creatorColumn: { flex: WIN.width > 700 ? 0.4 : 1 },
  chartColumn: { flex: WIN.width > 700 ? 0.6 : 1 },

  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    backgroundColor: "#fff",
  },
  creatorImg: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  creatorPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#eef2ff",
    marginRight: 12,
  },
  creatorName: { fontWeight: "700", color: "#0f172a" },
  creatorSubtitle: { color: "#6b7280", fontSize: 12 },

  // removed smallLikeBtn next to creator — no style needed here

  chartTitle: { fontWeight: "700", color: "#0f172a", marginBottom: 8 },
  chartTouchWrap: {
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    backgroundColor: "#fff",
  },
  chartLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 6,
  },
  chartLabelText: { color: "#6b7280", fontSize: 11 },

  // new: chart-aligned like button
  chartLikeWrap: { marginTop: 10, alignItems: "center" },
  chartLikeBtn: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  likeButtonDisabled: {
    opacity: 0.6,
  },
  chartLikeText: { fontWeight: "800", color: "#374151" },
  chartLikeTextActive: { color: "#9f1239" },

  extraCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eef2ff",
    marginTop: 12,
  },
  sectionTitle: {
    fontWeight: "800",
    fontSize: 16,
    color: "#0f172a",
    marginBottom: 8,
  },
  sectionText: { color: "#475569", lineHeight: 20 },

  actionsRow: { flexDirection: "row", marginTop: 12 },
  secondaryBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6e6f6",
    marginRight: 8,
  },
  secondaryBtnText: { color: "#4f46e5", fontWeight: "700" },
});
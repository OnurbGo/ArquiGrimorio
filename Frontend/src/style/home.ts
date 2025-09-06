import {
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";

const WIN = Dimensions.get("window");
const CAP_WIDTH = Math.min(WIN.width, 1200);
const vw = CAP_WIDTH / 100; // 1% of *capped* screen width
const vh = WIN.height / 100; 

export const stylesVars = {
  // keep site-dark theme consistent, adjust title colors to purple + deep blue
  bgStart: "#07070a",
  bgMid: "#0e0f14",
  bgEnd: "#141417",
  cardBg: "rgba(255,255,255,0.02)",
  purple: "#8f6bff",
  deepBlue: "#223a8a",
  teal: "#39e6b5",
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: stylesVars.bgStart,
  },
  hero: {
    paddingHorizontal: 6 * vw,
    paddingVertical: Platform.OS === "ios" ? 6 * vh : 5 * vh,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
  },
  badgeWrap: {
    width: "100%",
    alignItems: "center",
    marginBottom: 1 * vh,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2 * vw,
    color: "#fff",
    backgroundColor: "rgba(143,107,255,0.08)",
    paddingVertical: 1 * vh,
    paddingHorizontal: 3 * vw,
    borderRadius: 3 * vw,
  },
  badgeText: {
    color: "#dcd6ff",
    fontWeight: "700",
    fontSize: 2 * vw,
    marginLeft: 1.2 * vw,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1 * vh,
  },
  // title sizes now use capped vw so they remain large on mobile but reasonable on web
  titleLeft: {
    fontSize: 7 * vw,
    fontWeight: "900",
    color: stylesVars.purple,
    letterSpacing: 0.5 * vw,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0 * vw, height: 0.4 * vh },
    textShadowRadius: 6,
  },
  titleRight: {
    fontSize: 7 * vw,
    fontWeight: "900",
    color: stylesVars.deepBlue,
    letterSpacing: 0.5 * vw,
    marginLeft: 1 * vw,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0 * vw, height: 0.4 * vh },
    textShadowRadius: 6,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 1.2 * vh,
    maxWidth: 90 * vw,
    textAlign: "center",
    fontSize: 2 * vw,
    lineHeight: 3.8 * vw,
  },
  content: {
    paddingHorizontal: 5 * vw,
    paddingTop: 3 * vh,
  },
  sectionTitle: {
    color: "#e6d9c3",
    fontSize: 3 * vw,
    fontWeight: "700",
    marginBottom: 2 * vh,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 3 * vw,
  },
  statCard: {
    flex: 1,
    backgroundColor: stylesVars.cardBg,
    borderRadius: 2.2 * vw,
    paddingVertical: 2.2 * vh,
    paddingHorizontal: 3.6 * vw,
    marginHorizontal: 1 * vw,
    alignItems: "center",
    minWidth: 26 * vw,
    shadowColor: "#fff",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  statValue: {
    marginTop: 1.6 * vh,
    fontSize: 5 * vw,
    fontWeight: "900",
  },
  purpleValue: {
    color: stylesVars.purple,
  },
  blueValue: {
    color: stylesVars.deepBlue,
  },
  statLabel: {
    marginTop: 1 * vh,
    color: "#bfb4a6",
    fontSize: 2 * vw,
    fontWeight: "600",
  },
  extraSection: {
    marginTop: 4 * vh,
  },
  extraTitle: {
    color: "#e6d9c3",
    fontSize: 3 * vw,
    fontWeight: "800",
    marginBottom: 2 * vh,
    textAlign: "center",
  },
  featuresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  featureCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 2.6 * vw,
    paddingVertical: 2 * vh,
    paddingHorizontal: 3 * vw,
    marginHorizontal: 1 * vw,
    minWidth: 36 * vw,
    alignItems: "center",
    shadowColor: "#fff",
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  featureTitle: {
    marginTop: 1.2 * vh,
    fontSize: 2 * vw,
    fontWeight: "700",
    color: "#fff",
  },
  featureDesc: {
    marginTop: 1 * vh,
    fontSize: 2 * vw,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 3.4 * vw,
  },
});
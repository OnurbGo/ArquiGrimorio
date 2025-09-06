import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#07070a",
  },

  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 12 : 10,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },

  count: {
    color: "#d1cfe8",
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 32,
    color: "#d1cfe8",
  },

  // modal / blur
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },

  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 1001,
  },

  modalCard: {
    width: "100%",
    maxWidth: 900,
    backgroundColor: "#1a1a2b",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#7f32cc",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 20,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },

  label: {
    color: "#d1cfe8",
    marginBottom: 6,
    marginTop: 6,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#0f0f1a",
    borderWidth: 1,
    borderColor: "#2b2b45",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  /* Custom select (dark) */
  customPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0f0f1a",
    borderWidth: 1,
    borderColor: "#2b2b45",
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "web" ? 10 : 8,
    borderRadius: 10,
  },
  customPickerLabel: {
    color: "#fff",
    fontWeight: "600",
  },
  customPickerCaret: {
    color: "#8a87a8",
    marginLeft: 8,
  },
  customPickerDropdown: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: "#0f0f1a",
    borderWidth: 1,
    borderColor: "#2b2b45",
    borderRadius: 10,
    marginTop: 6,
    zIndex: 99999,
    elevation: 999,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    overflow: "hidden",
  },
  customPickerOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  customPickerOptionText: {
    color: "#fff",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },

  modalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 96,
    alignItems: "center",
  },

  cancelBtn: {
    backgroundColor: "#2b2b45",
  },

  saveBtn: {
    backgroundColor: "#7f32cc",
  },

  modalBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  deleteBigBtn: {
    marginTop: 6,
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  deleteBigText: {
    color: "#fff",
    fontWeight: "800",
  },

  pickerModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 99999,
  },
  pickerModalDropdown: {
    position: "absolute",
    top: Platform.OS === "web" ? "35%" : "30%",
    left: Platform.OS === "web" ? "30%" : 20,
    right: Platform.OS === "web" ? "30%" : 20,
    minWidth: Platform.OS === "web" ? 320 : undefined,
    maxWidth: Platform.OS === "web" ? 400 : undefined,
    backgroundColor: "#0f0f1a",
    borderWidth: 1,
    borderColor: "#2b2b45",
    borderRadius: 10,
    zIndex: 99999,
    elevation: 999,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    overflow: "hidden",
    padding: 8,
    alignSelf: Platform.OS === "web" ? "center" : undefined,
  },
});
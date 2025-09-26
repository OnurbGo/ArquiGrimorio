import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

type Props = {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | any;
  textStyle?: TextStyle | any;
  accessibilityLabel?: string;
};

export default function Button({
  children,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`mt-[18px] py-3 px-6 rounded-lg items-center${
        isDisabled ? " opacity-70" : ""
      }`}
      style={[{ backgroundColor: "#8b5cf6" }, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text className="text-white font-bold text-base" style={textStyle}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

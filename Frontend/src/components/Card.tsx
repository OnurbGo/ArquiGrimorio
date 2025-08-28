import { ReactNode } from "react";
import { View } from "react-native";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View className={`rounded-2xl border bg-white shadow-sm ${className}`}>
      {children}
    </View>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <View className={`p-4 border-b ${className}`}>{children}</View>;
}

export function CardContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <View className={`p-4 ${className}`}>{children}</View>;
}

export function CardFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`p-4 border-t flex flex-row items-center justify-between ${className}`}
    >
      {children}
    </View>
  );
}

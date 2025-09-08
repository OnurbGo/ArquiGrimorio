import React from "react";
import { ScrollView } from "react-native";
import { cn } from "../utils/cn";

interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScreenContainer({
  children,
  className,
}: ScreenContainerProps) {
  return (
    <ScrollView
      contentContainerClassName={cn("flex-grow p-4", className)}
    >
      {children}
    </ScrollView>
  );
}

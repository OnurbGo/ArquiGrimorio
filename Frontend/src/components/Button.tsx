import { ReactNode } from "react";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { cn } from "../utils/cn";

interface Props extends TouchableOpacityProps {
  children: ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md";
}

export function Button({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: Props) {
  const base = "rounded-lg font-medium items-center justify-center";
  const variants: Record<string, string> = {
    default: "bg-blue-600",
    outline: "border border-gray-300",
    ghost: "bg-transparent",
  };
  const textVariants: Record<string, string> = {
    default: "text-white",
    outline: "text-gray-700",
    ghost: "text-gray-600",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
  };
  const textSizes: Record<string, string> = {
    sm: "text-sm",
    md: "text-base",
  };

  return (
    <TouchableOpacity
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      <Text className={cn(textVariants[variant], textSizes[size])}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

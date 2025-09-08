import { Text } from "react-native";
import { cn } from "../utils/cn";

export default function GradientLogo({ className }: { className?: string }) {
  return (
    <Text
      className={cn("text-base font-semibold text-[#a78bfa]", className)}
    >
      Arquigrimório
    </Text>
  );
}

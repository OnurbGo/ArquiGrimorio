import { LinearGradient } from "expo-linear-gradient";
import { Sparkles } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CardExplanations from "@/components/profile/CardExplanations";
import CardStats from "@/components/profile/CardStats";
import Navigation from "@/components/Navigation";

export default function Home() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bgStart" style={{ paddingTop: insets.top }}>
      <Navigation />

      <ScrollView style={{ flex: 1 }}>
        {/* Hero Section */}
        <LinearGradient
          colors={["#07070a", "#0e0f14", "#141417"]} // bgStart, bgMid, bgEnd
          start={[0, 0]}
          end={[1, 1]}
          className="px-6 py-10 items-center rounded-b-2xl"
        >
          <View className="w-full items-center mb-2">
            <View className="flex-row items-center gap-2 bg-purple/10 py-2 px-4 rounded-full">
              <Sparkles width={16} height={16} color="#dcd6ff" />
              <Text className="text-badgeText font-bold text-sm ml-1">
                Biblioteca Colaborativa
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-center mt-2">
            <Text className="text-5xl font-black text-purple tracking-wider [text-shadow:0_2px_6px_rgba(0,0,0,0.6)]">
              Arqui
            </Text>
            <Text className="text-5xl font-black text-deepBlue tracking-wider ml-2 [text-shadow:0_2px_6px_rgba(0,0,0,0.6)]">
              Grimório
            </Text>
          </View>

          <Text className="text-subtitle mt-3 max-w-[90%] text-center text-base leading-relaxed">
            Descubra, crie e compartilhe itens mágicos únicos para suas
            aventuras de RPG. Uma biblioteca colaborativa feita por jogadores,
            para jogadores.
          </Text>
        </LinearGradient>
        {/* End of HeroSection */}

        <View className="px-5 pt-6">
          <Text className="text-sectionTitle text-2xl font-bold mb-4 text-center">
            Visão Geral
          </Text>
          <CardStats />
        </View>
        <View className="mt-8 mb-8">
          <Text className="text-sectionTitle text-2xl font-extrabold mb-4 text-center">
            Como funciona
          </Text>
          <CardExplanations />
        </View>
      </ScrollView>
    </View>
  );
}
import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  Library,
  Search,
  Sparkles,
  User as UserIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Navigation from "../components/Navigation";
import { getUserCount } from "../hooks/user/user";
import { getItems } from "../hooks/itens/item";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles, stylesVars } from "../style/home";

export default function Home() {
  const [itemCount, setItemCount] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const items = await getItems();
        const users = await getUserCount();
        setItemCount(items.length);
        setUserCount(users);
      } catch {
        setItemCount(null);
        setUserCount(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <View style={{ paddingTop: insets.top + 10, ...styles.safeArea }}>
      <Navigation />

      <ScrollView style={{ flexGrow: 1 }}>
        {/* Possible component: HeroSection */}
        <LinearGradient
          colors={[stylesVars.bgStart, stylesVars.bgMid, stylesVars.bgEnd]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.hero}
        >
          <View style={styles.badgeWrap}>
            <View style={styles.badge}>
              <Sparkles width={16} height={16} />
              <Text style={styles.badgeText}>Biblioteca Colaborativa</Text>
            </View>
          </View>

          <View style={styles.titleWrap}>
            <Text style={styles.titleLeft}>Arqui</Text>
            <Text style={styles.titleRight}>Grimório</Text>
          </View>

          <Text style={styles.subtitle}>
            Descubra, crie e compartilhe itens mágicos únicos para suas
            aventuras de RPG. Uma biblioteca colaborativa feita por jogadores,
            para jogadores.
          </Text>
        </LinearGradient>
        {/* End of HeroSection */}

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Visão Geral</Text>

          {/* Possible component: StatsSection */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <BookOpen color="#fff" width={28} height={28} />
              {loading ? (
                <ActivityIndicator style={{ marginTop: 14 }} />
              ) : (
                <>
                  <Text style={[styles.statValue, styles.purpleValue]}>
                    {itemCount ?? "-"}
                  </Text>
                  <Text style={styles.statLabel}>Itens Cadastrados</Text>
                </>
              )}
            </View>

            <View style={styles.statCard}>
              <UserIcon color="#fff" width={28} height={28} />
              {loading ? (
                <ActivityIndicator style={{ marginTop: 14 }} />
              ) : (
                <>
                  <Text style={[styles.statValue, styles.blueValue]}>
                    {userCount ?? "-"}
                  </Text>
                  <Text style={styles.statLabel}>Criadores Ativos</Text>
                </>
              )}
            </View>
          </View>
          {/* End of StatsSection */}

          {/* Possible component: FeaturesSection */}
          <View style={styles.extraSection}>
            <Text style={styles.extraTitle}>Como funciona</Text>

            <View style={styles.featuresRow}>
              <View style={styles.featureCard}>
                <Search color="#fff" width={22} height={22} />
                <Text style={styles.featureTitle}>Busca Inteligente</Text>
                <Text style={styles.featureDesc}>
                  Encontre itens por nome, raridade ou efeitos — filtros
                  avançados facilitam a descoberta.
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Library color="#fff" width={22} height={22} />
                <Text style={styles.featureTitle}>Criação Colaborativa</Text>
                <Text style={styles.featureDesc}>
                  Cadastre itens, compartilhe com a comunidade e aprimore
                  criações coletivas.
                </Text>
              </View>
            </View>
          </View>
          {/* End of FeaturesSection */}
        </View>
      </ScrollView>
    </View>
  );
}

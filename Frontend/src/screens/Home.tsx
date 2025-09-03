import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  Library,
  Search,
  Sparkles,
  User as UserIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Navigation from "../components/Navigation";
import {getUserCount } from "../hooks/user/user";
import { getItems } from "../hooks/itens/item";

// Use a capped width for `vw` so fonts don't scale unbounded on very wide web screens
const WIN = Dimensions.get("window");
const CAP_WIDTH = Math.min(WIN.width, 1200); // cap at 1200px for large screens
const vw = CAP_WIDTH / 100; // 1% of *capped* screen width
const vh = WIN.height / 100; // 1% of screen height

const Home: React.FC = () => {
  const [itemCount, setItemCount] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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
    <SafeAreaView style={styles.safeArea}>
      <Navigation />

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
          Descubra, crie e compartilhe itens mágicos únicos para suas aventuras
          de RPG. Uma biblioteca colaborativa feita por jogadores, para
          jogadores.
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Visão Geral</Text>

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

        <View style={styles.extraSection}>
          <Text style={styles.extraTitle}>Como funciona</Text>

          <View style={styles.featuresRow}>
            <View style={styles.featureCard}>
              <Search color="#fff" width={22} height={22} />
              <Text style={styles.featureTitle}>Busca Inteligente</Text>
              <Text style={styles.featureDesc}>
                Encontre itens por nome, raridade ou efeitos — filtros avançados
                facilitam a descoberta.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Library color="#fff" width={22} height={22} />
              <Text style={styles.featureTitle}>Criação Colaborativa</Text>
              <Text style={styles.featureDesc}>
                Cadastre itens, compartilhe com a comunidade e aprimore criações
                coletivas.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const stylesVars = {
  // keep site-dark theme consistent, adjust title colors to purple + deep blue
  bgStart: "#07070a",
  bgMid: "#0e0f14",
  bgEnd: "#141417",
  cardBg: "rgba(255,255,255,0.02)",
  purple: "#8f6bff",
  deepBlue: "#223a8a",
  teal: "#39e6b5",
};

const styles = StyleSheet.create({
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

export default Home;

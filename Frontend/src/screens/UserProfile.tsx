// UserProfile.tsx (atualizado para grid dinâmica)
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Button from "../components/Button";
import ItemCard from "../components/ItemCard";
import Navigation from "../components/Navigation";
import { Item } from "../interface/Item";
import { User } from "../interface/User";
import api, { getLikesByUser, getLikesForItem } from "../services/api";
import { useAuth } from "../utils/AuthContext";

type RootStackParamList = {
  Home: undefined;
  UserProfile: { userId?: number };
  ItemDetails: { id: number };
};

type UserProfileNavigationProp = StackNavigationProp<
  RootStackParamList,
  "UserProfile"
>;
type UserProfileRouteProp = RouteProp<RootStackParamList, "UserProfile">;

const WIN = Dimensions.get("window");
const HORIZONTAL_PADDING = 32; // container padding left+right (16 each)
const GAP = 12; // gap between cards
const MIN_CARD_WIDTH = 160; // ajuste este valor para controlar quantos cabem

export default function UserProfile() {
  const navigation = useNavigation<UserProfileNavigationProp>();
  const route = useRoute<UserProfileRouteProp>();
  const routeUserId = route?.params?.userId;
  const { user: authUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [itemsWithLikes, setItemsWithLikes] = useState<any[]>([]);
  const [userLikesTotal, setUserLikesTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // responsive width
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width
  );
  useEffect(() => {
    const handler = ({ window }: { window: { width: number } }) => {
      setWindowWidth(window.width);
    };
    const sub = Dimensions.addEventListener?.("change", handler);
    return () => sub?.remove?.();
  }, []);

  // compute columns based on available width, min card width and cap to 4
  const columns = useMemo(() => {
    const available = Math.max(0, windowWidth - HORIZONTAL_PADDING);
    const cols = Math.floor(available / MIN_CARD_WIDTH) || 1;
    return Math.min(Math.max(cols, 1), 4);
  }, [windowWidth]);

  // compute item width so cards fill the row
  const itemWidth = useMemo(() => {
    const totalGap = GAP * (columns - 1);
    const available = Math.max(
      0,
      Math.min(windowWidth, WIN.width) - HORIZONTAL_PADDING - totalGap
    );
    return Math.floor(available / columns);
  }, [columns, windowWidth]);

  const fetchUserData = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        setError(null);

        const userRes = await api.get(`/users/${id}`);
        const userData: User = userRes.data;

        const itemsRes = await api.get(`/users/${id}/item`);
        const itemsData: Item[] = itemsRes.data;

        const likesPromises = itemsData.map(async (item) => {
          try {
            const likes = await getLikesForItem(item.id);
            let isLiked = false;
            if (authUser && authUser.id) {
              const userLikes = await getLikesByUser(authUser.id);
              isLiked = userLikes.some((like: any) => like.item_id === item.id);
            }
            return { ...item, likes, isLiked };
          } catch {
            return { ...item, likes: 0, isLiked: false };
          }
        });
        const itemsWithLikesData = await Promise.all(likesPromises);

        let totalLikes = 0;
        if (authUser && authUser.id) {
          try {
            const userLikesArr = await getLikesByUser(authUser.id);
            totalLikes = Array.isArray(userLikesArr) ? userLikesArr.length : 0;
          } catch {
            totalLikes = 0;
          }
        }

        setUser(userData);
        setUserItems(itemsData);
        setItemsWithLikes(itemsWithLikesData);
        setUserLikesTotal(totalLikes);
      } catch (err: any) {
        console.error("fetchUserData error:", err);
        setError(err?.message ?? "Erro ao buscar dados do usuário");
      } finally {
        setLoading(false);
      }
    },
    [authUser]
  );

  useEffect(() => {
    (async () => {
      if (routeUserId !== undefined && routeUserId !== null) {
        await fetchUserData(Number(routeUserId));
        return;
      }

      if (authUser && authUser.id) {
        await fetchUserData(authUser.id);
        return;
      }

      setLoading(false);
      setError("Usuário não especificado");
    })();
  }, [routeUserId, authUser, fetchUserData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const idToFetch = routeUserId ?? authUser?.id;
      if (idToFetch) await fetchUserData(Number(idToFetch));
    } finally {
      setRefreshing(false);
    }
  }, [routeUserId, authUser, fetchUserData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingRoot}>
        <ActivityIndicator size="large" color="#6d28d9" />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.root}>
        <Navigation />
        <View style={styles.centerFull}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              {error ?? "Usuário não encontrado"}
            </Text>
            <Button onPress={() => navigation.navigate("Home")}>
              Voltar ao Início
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U";

  return (
    <SafeAreaView style={styles.root}>
      <Navigation />
      <View style={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.headerRow}>
            <View style={styles.avatarWrap}>
              {user.url_img ? (
                <Image
                  source={{ uri: user.url_img }}
                  style={styles.avatarImg}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{user.name || "Usuário"}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>Criador</Text>
              </View>

              <Text style={styles.userDescription}>
                {user.description || "Este usuário não adicionou descrição."}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statNumber}>{userItems.length}</Text>
            <Text style={styles.statLabel}>Itens Criados</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={styles.statNumber}>{userLikesTotal}</Text>
            <Text style={styles.statLabel}>Likes Totais</Text>
          </View>
        </View>

        <View style={styles.itemsHeader}>
          <Text style={styles.itemsTitle}>
            Itens Criados por {user.name || "Usuário"}
          </Text>
          <Text style={styles.itemsCount}>
            {userItems.length} {userItems.length === 1 ? "item" : "itens"}
          </Text>
        </View>

        {itemsWithLikes.length > 0 ? (
          <FlatList
            data={itemsWithLikes}
            keyExtractor={(it) => String(it.id)}
            numColumns={columns}
            renderItem={({ item, index }) => {
              const isLastInRow = (index + 1) % columns === 0;
              return (
                <View
                  style={[
                    styles.itemWrap,
                    { width: itemWidth, marginRight: isLastInRow ? 0 : GAP },
                  ]}
                >
                  <ItemCard
                    item={item}
                    onView={(id: number) =>
                      navigation.navigate("ItemDetails", { id })
                    }
                  />
                </View>
              );
            }}
            contentContainerStyle={[styles.listContent, { paddingBottom: 36 }]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#6d28d9"]}
              />
            }
            columnWrapperStyle={
              columns > 1
                ? { justifyContent: "flex-start", marginBottom: 12 }
                : undefined
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>Nenhum item criado ainda</Text>
            <Text style={styles.emptyText}>
              {user.name || "Este usuário"} ainda não criou nenhum item mágico
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f7fafc" },
  loadingRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7fafc",
  },
  container: { flex: 1, padding: 16 },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.06)",
    marginBottom: 12,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  avatarWrap: { marginRight: 12 },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "#6d28d9",
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e9d5ff",
  },
  avatarInitials: { fontSize: 28, fontWeight: "800", color: "#6d28d9" },

  headerInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  roleBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  roleBadgeText: { color: "#4f46e5", fontWeight: "700" },
  userDescription: { marginTop: 8, color: "#6b7280" },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 14,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statIcon: { fontSize: 18 },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 6,
  },
  statLabel: { color: "#6b7280", marginTop: 4 },

  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemsTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  itemsCount: { color: "#6b7280" },

  listContent: { paddingBottom: 36 },
  columnWrapper: { justifyContent: "space-between", paddingBottom: 12 },

  // itemWrap width is injected inline (calculated), keep marginBottom for vertical spacing
  itemWrap: { marginBottom: 12 },

  emptyBox: { alignItems: "center", padding: 32 },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { color: "#6b7280", textAlign: "center" },

  centerFull: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  errorTitle: { color: "#ef4444", fontWeight: "800", marginBottom: 8 },
});

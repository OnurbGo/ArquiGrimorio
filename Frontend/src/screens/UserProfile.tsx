import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
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

// Adicione ou importe RootStackParamList
type RootStackParamList = {
  Home: undefined;
  UserProfile: { userId?: number };
  ItemDetails: { id: number };
  // Adicione outras rotas conforme necessário
};

type UserProfileNavigationProp = StackNavigationProp<
  RootStackParamList,
  "UserProfile"
>;
type UserProfileRouteProp = RouteProp<RootStackParamList, "UserProfile">;

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

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async (id: number) => {
      try {
        setLoading(true);
        setError(null);

        const userRes = await api.get(`/users/${id}`);
        const userData: User = userRes.data;

        // endpoint que você já usava: /users/:id/item
        const itemsRes = await api.get(`/users/${id}/item`);
        const itemsData: Item[] = itemsRes.data;

        // Buscar likes e estado de like para cada item
        const likesPromises = itemsData.map(async (item) => {
          try {
            // total de likes
            const likes = await getLikesForItem(item.id);
            // se o usuário autenticado curtiu
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

        // Buscar likes totais dados pelo usuário
        let userLikesTotal = 0;
        if (authUser && authUser.id) {
          try {
            const userLikesArr = await getLikesByUser(authUser.id);
            userLikesTotal = Array.isArray(userLikesArr)
              ? userLikesArr.length
              : 0;
          } catch {
            userLikesTotal = 0;
          }
        }

        if (!mounted) return;
        setUser(userData);
        setUserItems(itemsData);
        setItemsWithLikes(itemsWithLikesData);
        setUserLikesTotal(userLikesTotal);
      } catch (err: any) {
        console.error("fetchUserData error:", err);
        if (!mounted) return;
        setError(err?.message ?? "Erro ao buscar dados do usuário");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    (async () => {
      // prioridade: route param userId
      if (routeUserId !== undefined && routeUserId !== null) {
        await fetchUserData(Number(routeUserId));
        return;
      }

      // fallback: se houver user no contexto (usuário logado), mostra ele
      if (authUser && authUser.id) {
        await fetchUserData(authUser.id);
        return;
      }

      // se não temos userId nem authUser, mostra erro / redireciona
      setLoading(false);
      setError("Usuário não especificado");
    })();

    return () => {
      mounted = false;
    };
  }, [routeUserId, authUser]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.center}>
          <Text style={styles.errorTitle}>
            {error || "Usuário não encontrado"}
          </Text>
          <Button onPress={() => navigation.navigate("Home")}>
            Voltar ao Início
          </Button>
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
    <SafeAreaView style={{ flex: 1 }}>
      <Navigation />
      <View style={{ flex: 1 }}>
        {/* Profile Header */}
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              {user.url_img ? (
                <Image
                  source={{ uri: user.url_img }}
                  style={styles.avatarImg}
                />
              ) : (
                <Text style={styles.initials}>{initials}</Text>
              )}
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.name}>{user.name || "Usuário"}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Criador</Text>
              </View>

              <Text style={styles.description}>
                {user.description || "Este usuário não adicionou descrição."}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
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

        {/* User Items */}
        <View style={{ width: "100%" }}>
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
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              renderItem={({ item }) => (
                <ItemCard
                  item={item}
                  onView={(id) => navigation.navigate("ItemDetails", { id })}
                />
              )}
              contentContainerStyle={styles.container}
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
      </View>
    </SafeAreaView>
  );
}

/* estilos: copie os seus estilos originais abaixo */
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: { padding: 16 },
  card: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginVertical: 8,
  },
  header: { flexDirection: "row" },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: 12,
  },
  avatarImg: { width: "100%", height: "100%" },
  initials: { fontSize: 24, fontWeight: "700" },
  headerInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: "700" },
  badge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#eee",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  badgeText: { fontWeight: "600" },
  description: { marginTop: 8, color: "#666" },
  metaRow: { marginTop: 8, flexDirection: "row" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    minWidth: 100,
  },
  statIcon: { fontSize: 20 },
  statNumber: { fontSize: 18, fontWeight: "700" },
  statLabel: { color: "#666" },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  itemsTitle: { fontSize: 18, fontWeight: "700" },
  itemsCount: { color: "#666" },
  emptyBox: { alignItems: "center", padding: 24 },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { color: "#666", textAlign: "center" },
  errorTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
});

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "../components/Button";
import ItemCard from "../components/ItemCard";
import Navigation from "../components/Navigation";
import { Item } from "../interface/Item";
import { User } from "../interface/User";
import type { RootStackParamList } from "../navigation/Routes";

type UserProfileNavigationProp = StackNavigationProp<
  RootStackParamList,
  "UserProfile"
>;
type UserProfileRouteProp = RouteProp<RootStackParamList, "UserProfile">;

export default function UserProfile() {
  const navigation = useNavigation<UserProfileNavigationProp>();
  const route = useRoute<UserProfileRouteProp>();
  const userId = route?.params?.userId;

  const [user, setUser] = useState<User | null>(null);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userRes = await fetch(`/users/${userId}`);
        if (!userRes.ok) throw new Error("Erro ao buscar usuário");
        const userData: User = await userRes.json();

        const itemsRes = await fetch(`/users/${userId}/item`);
        if (!itemsRes.ok) throw new Error("Erro ao buscar itens");
        const itemsData: Item[] = await itemsRes.json();

        setUser(userData);
        setUserItems(itemsData);
      } catch (err: any) {
        setError(err.message || "Ocorreu um erro");
      } finally {
        setLoading(false);
      }
    };

    if (userId !== undefined && userId !== null) fetchUserData();
  }, [userId]);

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
        <Navigation />
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
      <ScrollView contentContainerStyle={styles.container}>
        <Button onPress={() => navigation.navigate("Home")}>
          Voltar ao Grimório
        </Button>

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

              <View style={styles.metaRow}>
                <Text>Terra Desconhecida</Text>
              </View>
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
            <Text style={styles.statIcon}>—</Text>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Likes Totais</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>—</Text>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Likes por Item</Text>
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

          {userItems.length > 0 ? (
            <FlatList
              data={userItems}
              keyExtractor={(it) => String(it.id)}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              renderItem={({ item }) => (
                <ItemCard
                  item={item}
                  onView={(id) => navigation.navigate("ItemDetails", { id })}
                  onLike={(id) => console.log("Like item:", id)}
                />
              )}
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
      </ScrollView>
    </SafeAreaView>
  );
}

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
  header: { flexDirection: "row" }, // removido 'gap'
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: 12, // substitui gap
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

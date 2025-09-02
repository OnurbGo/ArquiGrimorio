import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FilterPanel from "../components/FilterPanel";
import ItemCard from "../components/ItemCard";
import Navigation from "../components/Navigation";
import type { Item } from "../interface/Item";
import { default as api, getItems, getUserCount } from "../services/api";

type UIFilters = {
  search?: string;
  rarity?: string;
  type?: string;
  page?: number;
  q?: string;
};

const styles = {
  statsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center" as const,
  },
  statLabel: { color: "#b3b3b3", fontSize: 12, marginTop: 8 },
  statValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700" as const,
    marginTop: 4,
  },
  cardWrapper: { flex: 1, margin: 8 },
  columnWrapper: { justifyContent: "space-between" as const },
  listContent: { paddingBottom: 32 },
  emptyCard: {
    backgroundColor: "#23234a",
    borderColor: "#7f32cc",
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    marginTop: 32,
    alignItems: "center" as const,
  },
  emptyText: { color: "#b3b3b3", fontSize: 16, textAlign: "center" as const },
};

type ItemWithExtras = Item & {
  likes?: number;
  isLiked?: boolean;
  creator?: { name?: string; url_img?: string };
  image_url?: string;
};

const Home: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [items, setItems] = useState<ItemWithExtras[]>([]);
  const [stats, setStats] = useState({ itens: 0, criadores: 0, curtidas: 0 });
  const [filters, setFilters] = useState<UIFilters>({
    q: "",
    rarity: "todas",
    type: "todos",
    page: 1,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMsg(null);

    (async () => {
      try {
        let result: Item[] = await getItems();
        let totalLikes = 0;
        let totalCreators = 0;

        // Busca total de curtidas usando a nova rota
        try {
          const resp = await api.get("/itemlike/total");
          if (typeof resp.data === "number") {
            totalLikes = resp.data;
          } else if (resp.data && typeof resp.data.count === "number") {
            totalLikes = resp.data.count;
          } else {
            totalLikes = 0;
          }
        } catch {
          totalLikes = 0;
        }

        // Busca total de criadores
        try {
          totalCreators = await getUserCount();
        } catch {
          totalCreators = 0;
        }

        if (active) {
          setStats({
            itens: result.length,
            criadores: totalCreators,
            curtidas: totalLikes,
          });
        }

        if (filters.q) {
          const qLower = filters.q.toLowerCase();
          result = result.filter(
            (item) =>
              item.name?.toLowerCase().includes(qLower) ||
              item.description?.toLowerCase().includes(qLower)
          );
        }
        if (filters.rarity && filters.rarity !== "todas") {
          result = result.filter(
            (item) =>
              String(item.rarity).toLowerCase() ===
              String(filters.rarity).toLowerCase()
          );
        }
        if (filters.type && filters.type !== "todos") {
          result = result.filter(
            (item) =>
              String(item.type).toLowerCase() ===
              String(filters.type).toLowerCase()
          );
        }

        if (!active) return;
        // Adiciona propriedades extras para o ItemCard
        const itemsWithExtras: ItemWithExtras[] = result.map((item) => ({
          ...item,
          creator: item.creator ?? {
            id: item.user_id,
            name: "Desconhecido",
            url_img: "",
          },
          likes: 0, // pode ser ajustado se necessário
          isLiked: false,
        }));
        setItems(itemsWithExtras);
      } catch (err: any) {
        if (!active) return;
        setErrorMsg(err?.message ?? "Erro ao carregar itens");
      } finally {
        active && setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [filters]);

  function handleFilterChange(next: UIFilters) {
    setFilters((prev: UIFilters) => ({
      ...prev,
      q: next.search?.trim() || "",
      rarity: next.rarity ?? prev.rarity,
      type: next.type ?? prev.type,
      page: 1,
    }));
  }

  function handleView(id: number) {
    navigation.navigate("ItemDetails", { id });
  }

  const headerComponent = useMemo(
    () => (
      <View
        style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }}
      >
        {/* Estatísticas */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: "#1a1a2e", borderColor: "#7f32cc" },
            ]}
          >
            <MaterialCommunityIcons
              name="archive-outline"
              size={28}
              color="#7f32cc"
            />
            <Text style={styles.statLabel}>Itens Cadastrados</Text>
            <Text style={styles.statValue}>{stats.itens}</Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: "#1a1a2e", borderColor: "#7f32cc" },
            ]}
          >
            <Feather name="users" size={28} color="#7f32cc" />
            <Text style={styles.statLabel}>Criadores Ativos</Text>
            <Text style={styles.statValue}>{stats.criadores}</Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: "#1a1a2e", borderColor: "#7f32cc" },
            ]}
          >
            <AntDesign name="heart" size={28} color="#7f32cc" />
            <Text style={styles.statLabel}>Curtidas Totais</Text>
            <Text style={styles.statValue}>{stats.curtidas}</Text>
          </View>
        </View>

        {/* Título e descrição */}
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              borderRadius: 16,
              padding: 20,
              backgroundColor: "#23234a",
              borderColor: "#7f32cc",
              borderWidth: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
              Grimório de Itens
            </Text>
            <Text style={{ marginTop: 8, fontSize: 14, color: "#b3b3b3" }}>
              Explore, filtre e descubra itens místicos criados pela comunidade.
            </Text>
          </View>
        </View>

        {/* Filtros */}
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              backgroundColor: "#23234a",
              borderColor: "#7f32cc",
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
            }}
          >
            <FilterPanel onChange={handleFilterChange} />
          </View>
        </View>

        {/* Erro */}
        {errorMsg ? (
          <View
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 8,
              backgroundColor: "#7f32cc22",
              borderColor: "#7f32cc",
              borderWidth: 1,
            }}
          >
            <Text style={{ color: "#fff" }}>{errorMsg}</Text>
          </View>
        ) : null}
      </View>
    ),
    [errorMsg, stats]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a1747" }}>
      <Navigation />
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ItemCard item={item} onView={handleView} onLike={() => {}} />
          </View>
        )}
        ListHeaderComponent={
          <>
            {headerComponent}
            {loading && !items.length ? (
              <View style={{ paddingVertical: 32, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#7f32cc" />
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={{ paddingHorizontal: 16 }}>
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Nenhum item encontrado com os filtros atuais.
                </Text>
              </View>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Home;

// ...existing code...
// ...existing code...

// src/screens/Home.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import FilterPanel from "../components/FilterPanel";
import ItemCard from "../components/ItemCard";
import Navigation from "../components/Navigation";
import { Item, ItemFilters } from "../interface/Item";
import { getItems } from "../services/api";

const INITIAL_FILTERS: ItemFilters = {
  q: "",
  rarity: "todas",
  type: "todos",
  page: 1,
};

type UIFilters = {
  search?: string;
  rarity?: string;
  type?: string;
};

function normalizeItemsResponse(data: unknown): Item[] {
  if (Array.isArray(data)) return data as Item[];
  if (data && typeof data === "object" && Array.isArray((data as any).items)) {
    return (data as any).items as Item[];
  }
  return [];
}

type RootStackParamList = {
  Home: undefined;
  ItemDetails: { id: number };
};

export default function Home() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filters, setFilters] = useState<ItemFilters>(INITIAL_FILTERS);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const raw = await getItems({
          q: filters.q || undefined,
          rarity:
            filters.rarity && filters.rarity !== "todas"
              ? filters.rarity
              : undefined,
          type:
            filters.type && filters.type !== "todos" ? filters.type : undefined,
          page: filters.page,
        });

        let result = normalizeItemsResponse(raw);

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
        setItems(result);
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
    setFilters((prev) => ({
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Navigation />

      <ScrollView
        className="px-4 pb-10"
        contentContainerStyle={{ paddingTop: 12 }}
      >
        {/* Cabeçalho */}
        <View className="mb-4">
          <View className="rounded-2xl p-5 bg-card border border-border shadow-elevated">
            <Text className="text-2xl font-extrabold text-primary-foreground">
              Grimório de Itens
            </Text>
            <Text className="mt-2 text-sm text-muted-foreground">
              Explore, filtre e descubra itens místicos criados pela comunidade.
            </Text>
          </View>
        </View>

        {/* Conteúdo */}
        <View className="flex-col">
          {/* Filtros */}
          <View className="mb-4">
            <View className="bg-card p-3 rounded-xl border border-border">
              <FilterPanel onChange={handleFilterChange} />
            </View>
          </View>

          {/* Itens */}
          <View className="flex-1">
            {errorMsg && (
              <View className="mb-3 p-3 rounded-lg bg-destructive/10 border border-destructive">
                <Text className="text-destructive">{errorMsg}</Text>
              </View>
            )}

            {loading && !items.length ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#7f32cc" />
              </View>
            ) : items.length > 0 ? (
              <FlatList
                data={items}
                keyExtractor={(it) => String(it.id)}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                renderItem={({ item }) => (
                  <View style={styles.cardWrapper}>
                    <ItemCard
                      item={item}
                      onView={handleView}
                      onLike={() => {}}
                    />
                  </View>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View className="p-6 rounded-xl bg-card border border-border items-center">
                <Text className="text-muted-foreground">
                  Nenhum item encontrado com os filtros atuais.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Usamos StyleSheet para alguns estilos que FlatList requer (columnWrapper),
 * mantendo o restante com classes NativeWind para o tema.
 */
const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardWrapper: {
    width: "48%",
  },
  listContent: {
    paddingBottom: 48,
  },
});

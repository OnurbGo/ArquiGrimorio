// Search.tsx
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Search as SearchIcon } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Button from "../components/Button";
import ItemCard from "../components/ItemCard";
import Navigation from "../components/Navigation";
import ScreenContainer from "../components/ScreenContainer";
import { Item, ItemFilters } from "../interface/Item";
import { ItemLikeToggleResponse } from "../interface/ItemLike";
import { getItems, toggleItemLike } from "../services/api";
import { useAuth } from "../utils/AuthContext";

/* ---------- constants ---------- */
const RARITIES = [
  { value: "todas", label: "Todas" },
  { value: "comum", label: "Comum" },
  { value: "incomum", label: "Incomum" },
  { value: "raro", label: "Raro" },
  { value: "muito-raro", label: "Muito Raro" },
  { value: "lendario", label: "Lendário" },
  { value: "artefato", label: "Artefato" },
];

const TYPES = [
  { value: "todos", label: "Todos" },
  { value: "arma", label: "Arma" },
  { value: "armadura", label: "Armadura" },
  { value: "escudo", label: "Escudo" },
  { value: "pergaminho", label: "Pergaminho" },
  { value: "pocao", label: "Poção" },
  { value: "anel", label: "Anel" },
  { value: "amuleto", label: "Amuleto" },
  { value: "varinha", label: "Varinha" },
  { value: "cajado", label: "Cajado" },
  { value: "outros", label: "Outros" },
];

/* ---------- responsive helpers ---------- */
const WIN = Dimensions.get("window");
const CAP_WIDTH = Math.min(WIN.width, 1200); // cap to avoid huge vw on desktop
const baseVw = CAP_WIDTH / 100;
const baseVh = WIN.height / 100;
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

type RootStackParamList = {
  Home: undefined;
  ItemDetails: { id: number };
  CreateAccount: undefined;
  Login: undefined;
};

export default function Search() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();

  const [filters, setFilters] = useState<ItemFilters>({
    rarity: "todas",
    type: "todos",
    q: "",
    page: 1,
  });
  const [items, setItems] = useState<Item[]>([]);
  const [itemLikes, setItemLikes] = useState<
    Record<number, { likes: number; isLiked: boolean }>
  >({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // responsive columns
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width
  );
  useEffect(() => {
    const sub = Dimensions.addEventListener?.("change", ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => sub?.remove?.();
  }, []);

  // compute columns dynamically based on width (mobile:1, tablet/desktop: 2..4)
  const columns = useMemo(() => {
    if (windowWidth < 700) return 1;
    if (windowWidth < 1000) return 2;
    if (windowWidth < 1400) return 3;
    return 4;
  }, [windowWidth]);

  // compute item width (numeric px) to pass to wrapper so ItemCard has consistent size in grid.
  const itemWrapperWidth = useMemo(() => {
    const horizontalPadding = clamp(4 * baseVw, 12, 40) * 2; // container padding both sides
    const gap = 16 * (columns - 1); // approx gap between items
    const usable = Math.min(windowWidth, CAP_WIDTH) - horizontalPadding - gap;
    return Math.floor(usable / columns);
  }, [columns, windowWidth]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        let allItems = await getItems();
        if (!active) return;

        allItems = allItems.filter((item) => {
          const matchesQ =
            !filters.q ||
            item.name.toLowerCase().includes(filters.q.toLowerCase()) ||
            (item.description || "")
              .toLowerCase()
              .includes(filters.q.toLowerCase());
          const matchesRarity =
            filters.rarity === "todas" || item.rarity === filters.rarity;
          const matchesType =
            filters.type === "todos" || item.type === filters.type;
          return matchesQ && matchesRarity && matchesType;
        });

        setItems(allItems);
        // optional: could fetch likes for each item here
      } catch (err: any) {
        if (!active) return;
        setErrorMsg(err?.message ?? "Erro ao buscar itens");
      } finally {
        active && setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [filters]);

  function handleLike(id: number) {
    if (!token) return;
    toggleItemLike(id, token)
      .then((res: ItemLikeToggleResponse) => {
        setItemLikes((prev) => ({
          ...prev,
          [id]: { likes: res.totalLikes, isLiked: res.liked },
        }));
      })
      .catch(() => {
        // silent fail
      });
  }

  function clearFilters() {
    setFilters({ q: "", rarity: "todas", type: "todos", page: 1 });
  }

  /* ---------- styles variables (kept near top) ---------- */
  const stylesVars = {
    bg: "#f7fafc", // search area light bg
    panelBg: "#ffffff",
    muted: "#64748b",
    accent: "#6d28d9",
    cardBg: "#ffffff",
    border: "rgba(15,23,42,0.06)",
  };

  /* ---------- render ---------- */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: stylesVars.bg }}>
      <Navigation />
      <View style={{ flex: 1 }}>
        <ScreenContainer style={{ paddingVertical: clamp(2 * baseVh, 12, 28) }}>
          <View style={localStyles.header}>
            <Text style={localStyles.title}>Buscar Itens</Text>
            <Text style={localStyles.subtitle}>
              Encontre o item perfeito para sua aventura
            </Text>
          </View>

          {/* Filters card */}
          <View
            style={[
              localStyles.filtersCard,
              windowWidth >= 900
                ? localStyles.filtersRow
                : localStyles.filtersColumn,
            ]}
          >
            {/* Search input */}
            <View
              style={[localStyles.inputWrap, windowWidth >= 900 && { flex: 1 }]}
            >
              <Text style={localStyles.label}>Buscar</Text>
              <View style={localStyles.searchBox}>
                <SearchIcon width={18} height={18} color={stylesVars.muted} />
                <TextInput
                  placeholder="Digite o nome ou descrição..."
                  placeholderTextColor={stylesVars.muted}
                  style={localStyles.input}
                  value={filters.q}
                  onChangeText={(text) =>
                    setFilters((f) => ({ ...f, q: text, page: 1 }))
                  }
                  returnKeyType="search"
                />
              </View>
            </View>

            {/* Rarity picker */}
            <View
              style={[
                localStyles.pickerWrap,
                windowWidth >= 900 && { width: 220 },
                localStyles.filterBox, // Adiciona estilização similar à barra de busca
              ]}
            >
              <Text style={localStyles.label}>Raridade</Text>
              <View style={localStyles.pickerBox}>
                <Picker
                  selectedValue={filters.rarity}
                  onValueChange={(val) =>
                    setFilters((f) => ({ ...f, rarity: String(val), page: 1 }))
                  }
                  mode="dropdown"
                >
                  {RARITIES.map((r) => (
                    <Picker.Item
                      key={r.value}
                      label={r.label}
                      value={r.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Type picker */}
            <View
              style={[
                localStyles.pickerWrap,
                windowWidth >= 900 && { width: 220 },
                localStyles.filterBox, // Adiciona estilização similar à barra de busca
              ]}
            >
              <Text style={localStyles.label}>Tipo</Text>
              <View style={localStyles.pickerBox}>
                <Picker
                  selectedValue={filters.type}
                  onValueChange={(val) =>
                    setFilters((f) => ({ ...f, type: String(val), page: 1 }))
                  }
                  mode="dropdown"
                >
                  {TYPES.map((t) => (
                    <Picker.Item
                      key={t.value}
                      label={t.label}
                      value={t.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Clear button on the right on desktop, below on mobile */}
            <View style={localStyles.clearWrap}>
              <Button onPress={clearFilters}>Limpar Filtros</Button>
            </View>
          </View>

          {/* Results */}
          {errorMsg ? <Text style={localStyles.error}>{errorMsg}</Text> : null}

          {loading ? (
            <View style={localStyles.center}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 8 }}>Carregando itens...</Text>
            </View>
          ) : items.length > 0 ? (
            <FlatList
              data={items}
              keyExtractor={(it) => String(it.id)}
              numColumns={columns}
              columnWrapperStyle={
                columns > 1
                  ? { justifyContent: "space-between", marginBottom: 16 }
                  : undefined
              }
              renderItem={({ item }) => {
                const likeState = itemLikes[item.id] ?? {
                  likes: 0,
                  isLiked: false,
                };
                return (
                  <View
                    style={[
                      localStyles.itemWrapper,
                      columns === 1
                        ? { width: "100%", alignItems: "center" }
                        : { width: itemWrapperWidth, alignItems: "flex-start" },
                    ]}
                  >
                    <ItemCard
                      item={{
                        ...item,
                        likes: likeState.likes,
                        isLiked: likeState.isLiked,
                      }}
                      onLike={handleLike}
                      onView={(id) =>
                        navigation.navigate("ItemDetails", { id })
                      }
                    />
                  </View>
                );
              }}
              contentContainerStyle={[
                localStyles.listContent,
                columns === 1
                  ? { alignItems: "center" }
                  : { alignItems: "stretch" },
              ]}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={localStyles.empty}>
              <Text style={localStyles.emptyIcon}>🔍</Text>
              <Text style={localStyles.emptyTitle}>Nenhum item encontrado</Text>
              <Text style={localStyles.emptyText}>
                Tente ajustar os filtros
              </Text>
              <Button onPress={clearFilters} style={{ marginTop: 12 }}>
                Limpar Filtros
              </Button>
            </View>
          )}
        </ScreenContainer>
      </View>
    </SafeAreaView>
  );
}

/* ---------- local styles ---------- */
const localStyles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: clamp(2 * baseVh, 12, 24) },
  title: {
    fontSize: clamp(3.6 * baseVw, 20, 32),
    fontWeight: "800",
  },
  subtitle: { color: "#64748b", marginTop: 6 },

  filtersCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: clamp(1.6 * baseVw, 12, 18),
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
    // drop shadow (subtle)
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  filtersRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  filtersColumn: {
    flexDirection: "column",
  },

  inputWrap: { marginBottom: 8 },
  label: { fontWeight: "700", marginBottom: 6, color: "#0f172a" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
  },

  input: {
    flex: 1,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
    fontSize: clamp(1.6 * baseVw, 14, 16),
    color: "#0f172a",
  },

  pickerWrap: { marginBottom: 8 },
  pickerBox: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
    backgroundColor: "#fafafa",
  },

  clearWrap: {
    marginTop: Platform.OS === "web" ? 0 : 8,
    marginLeft: "auto",
    alignSelf: "center",
  },

  center: { alignItems: "center", padding: 24 },
  empty: { alignItems: "center", padding: 24 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { color: "#64748b", marginBottom: 12 },

  error: { color: "red", marginBottom: 12 },

  // list/grid styles
  listContent: {
    paddingBottom: 40,
    paddingTop: 6,
    // horizontal padding controlled by ScreenContainer; keep some vertical spacing
  },
  itemWrapper: {
    // marginBottom provided by columnWrapperStyle or spacing in render
    padding: 8,
  },

  filterBox: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
    marginBottom: 8,
  },
});

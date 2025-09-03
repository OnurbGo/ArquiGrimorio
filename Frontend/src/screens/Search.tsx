// Search.tsx (grid automática — cabe até 4 por linha)
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
import {
  getLikesByUser,
  getLikesForItem,
  toggleItemLike,
} from "../hooks/itens/itemLike";
import { getItems } from "../hooks/itens/item";
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

// grid config
const HORIZONTAL_PADDING = 32; // container left+right padding (16 + 16)
const GAP = 12; // gap between cards (px)
const MIN_CARD_WIDTH = 160; // minimal card width to try to fit 4 in row on wider screens
const MAX_COLUMNS = 4;

type RootStackParamList = {
  Home: undefined;
  ItemDetails: { id: number };
  CreateAccount: undefined;
  Login: undefined;
};

export default function Search() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token, user } = useAuth();

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
    const handler = ({ window }: { window: { width: number } }) =>
      setWindowWidth(window.width);
    const sub = Dimensions.addEventListener?.("change", handler);
    return () => sub?.remove?.();
  }, []);

  // compute columns dynamically based on width but prefer fitting up to MAX_COLUMNS
  const columns = useMemo(() => {
    const available = Math.max(0, windowWidth - HORIZONTAL_PADDING);
    const possible = Math.floor(available / MIN_CARD_WIDTH) || 1;
    const cols = Math.min(Math.max(possible, 1), MAX_COLUMNS);
    // keep at least 1 column on narrow screens
    return cols;
  }, [windowWidth]);

  // compute item width (numeric px) so ItemCard wrapper has consistent size in grid.
  const itemWrapperWidth = useMemo(() => {
    const totalGap = GAP * (columns - 1);
    const usable =
      Math.min(windowWidth, CAP_WIDTH) - HORIZONTAL_PADDING - totalGap;
    return Math.floor(Math.max(0, usable / columns));
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

        if (!active) return;
        setItems(allItems);

        // -------------------------
        // Buscar likes de maneira otimizada:
        // - buscar os likes totais para todos os itens em paralelo
        // - buscar os likes do usuário apenas uma vez (se autenticado)
        // -------------------------
        const userId =
          typeof token === "string" && token && user?.id ? user.id : null;

        // Promise.all para likes totais (cada chamada trata falha com 0)
        const likesPromises = allItems.map((item) =>
          getLikesForItem(item.id).catch(() => 0)
        );
        const likesResults = await Promise.all(likesPromises);

        // buscar user likes uma vez (se aplicável)
        let userLikesArr: any[] = [];
        if (token && userId) {
          try {
            userLikesArr = await getLikesByUser(userId, token);
            if (!Array.isArray(userLikesArr)) userLikesArr = [];
          } catch {
            userLikesArr = [];
          }
        }

        // construir objeto de estado para itemLikes
        const likesObj: Record<number, { likes: number; isLiked: boolean }> =
          {};
        allItems.forEach((item, idx) => {
          const totalLikes =
            typeof likesResults[idx] === "number" ? likesResults[idx] : 0;
          const isLiked = userLikesArr.some(
            (l: any) => Number(l.item_id) === Number(item.id)
          );
          likesObj[item.id] = { likes: totalLikes, isLiked };
        });

        if (!active) return;
        setItemLikes(likesObj);
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
  }, [filters, token, user?.id]);

  // handleLike: pai faz a chamada (ItemCard delega quando onLike existe)
  async function handleLike(id: number) {
    if (!token || !user?.id) {
      console.warn("Token ou user.id ausente, não é possível dar like");
      return;
    }
    try {
      const res = await toggleItemLike(id, token);

      setItemLikes((prev) => {
        const prevState = prev[id] || { likes: 0, isLiked: false };
        // Preferir dados do backend quando disponíveis
        const isLiked =
          typeof res?.liked === "boolean" ? res.liked : !prevState.isLiked;
        const likes =
          typeof res?.totalLikes === "number"
            ? res.totalLikes
            : isLiked
            ? prevState.likes + 1
            : Math.max(prevState.likes - 1, 0);

        return {
          ...prev,
          [id]: { likes, isLiked },
        };
      });
    } catch (err) {
      console.error("Erro ao dar like:", err);
    }
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
                localStyles.filterBox,
              ]}
            >
              <Text style={localStyles.label}>Raridade</Text>
              <View style={localStyles.pickerBox}>
                <Picker
                  selectedValue={filters.rarity}
                  onValueChange={(val) =>
                    setFilters((f) => ({ ...f, rarity: val, page: 1 }))
                  }
                  style={{
                    width: "100%",
                    color: "#222",
                    backgroundColor: "#f1f5f9",
                    borderWidth: 0,
                    borderRadius: 10,
                  }}
                  dropdownIconColor="#64748b"
                >
                  {RARITIES.map((opt) => (
                    <Picker.Item
                      key={opt.value}
                      label={opt.label}
                      value={opt.value}
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
                localStyles.filterBox,
              ]}
            >
              <Text style={localStyles.label}>Tipo</Text>
              <View style={localStyles.pickerBox}>
                <Picker
                  selectedValue={filters.type}
                  onValueChange={(val) =>
                    setFilters((f) => ({ ...f, type: val, page: 1 }))
                  }
                  style={{
                    width: "100%",
                    color: "#222",
                    backgroundColor: "#f1f5f9",
                    borderWidth: 0,
                    borderRadius: 10,
                  }}
                  dropdownIconColor="#64748b"
                >
                  {TYPES.map((opt) => (
                    <Picker.Item
                      key={opt.value}
                      label={opt.label}
                      value={opt.value}
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
              renderItem={({ item, index }) => {
                const likeState = itemLikes[item.id] ?? {
                  likes: 0,
                  isLiked: false,
                };
                const isLastInRow = (index + 1) % columns === 0;
                return (
                  <View
                    style={[
                      localStyles.itemWrapper,
                      {
                        width: columns === 1 ? "100%" : itemWrapperWidth,
                        marginRight: columns === 1 ? 0 : isLastInRow ? 0 : GAP,
                        alignItems: columns === 1 ? "center" : "flex-start",
                      },
                    ]}
                  >
                    <ItemCard
                      item={{
                        ...item,
                        likes: likeState.likes,
                        isLiked: likeState.isLiked,
                      }}
                      onLike={handleLike} // pai gerencia o toggle agora
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
              columnWrapperStyle={
                columns > 1
                  ? { justifyContent: "flex-start", marginBottom: 16 }
                  : undefined
              }
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
    backgroundColor: "#f1f5f9",
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
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: Platform.OS === "web" ? 6 : 0,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: "relative",
    minHeight: 42,
  },
  pickerCaret: {
    position: "absolute",
    right: 10,
    top: Platform.OS === "android" ? 10 : 12,
    fontSize: 16,
    color: "#64748b",
    pointerEvents: "none",
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

  listContent: {
    paddingBottom: 40,
    paddingTop: 6,
  },
  itemWrapper: {
    paddingVertical: 8,
  },

  filterBox: {
    backgroundColor: "#f7fafc",
    borderRadius: 8,
    paddingVertical: Platform.OS === "web" ? 8 : 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
    marginBottom: 8,
  },
});

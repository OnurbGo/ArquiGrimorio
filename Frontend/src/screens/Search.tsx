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
  Text,
  TextInput,
  View,
} from "react-native";
import Button from "../components/Button";
import ItemCard from "../components/ItemCard";
import Navigation from "../components/Navigation";
import { Item, ItemFilters } from "../interface/Item";
import {
  getLikesByUser,
  getLikesForItem,
  toggleItemLike,
} from "../hooks/itens/itemLike";
import { getItems } from "../hooks/itens/item";
import { useAuth } from "../utils/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";

const HORIZONTAL_PADDING = 32; // container left+right padding (16 + 16)
const GAP = 12; // gap between cards (px)
const MIN_CARD_WIDTH = 160; // minimal card width to try to fit 4 in row on wider screens
const MAX_COLUMNS = 4;
const CAP_WIDTH = 1200; // cap to avoid huge vw on desktop

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
  const insets = useSafeAreaInsets();
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

  /* ---------- render ---------- */
  return (
    <View
      className="flex-1 bg-slate-50"
      style={{ paddingTop: insets.top }}
    >
      <Navigation />
      <View className="flex-1">
        <ScrollView className="py-3 md:py-7">
          <View className="items-center mb-4 md:mb-6">
            <Text className="text-2xl md:text-3xl font-extrabold">
              Buscar Itens
            </Text>
            <Text className="text-slate-500 mt-1.5">
              Encontre o item perfeito para sua aventura
            </Text>
          </View>

          {/* Filters card */}
          <View className="bg-slate-100 rounded-xl p-3 md:p-4 mb-4 border border-slate-900/10 shadow-md md:flex-row md:items-end md:gap-3">
            {/* Search input */}
            <View className="mb-2 md:flex-1">
              <Text className="font-bold mb-1.5 text-slate-900">Buscar</Text>
              <View className="flex-row items-center gap-2 bg-slate-200/60 rounded-lg py-2 px-2.5 border border-slate-900/10">
                <SearchIcon width={18} height={18} color={"#64748b"} />
                <TextInput
                  placeholder="Digite o nome ou descrição..."
                  placeholderTextColor={"#64748b"}
                  className="flex-1 py-0 text-base text-slate-900"
                  value={filters.q}
                  onChangeText={(text) =>
                    setFilters((f) => ({ ...f, q: text, page: 1 }))
                  }
                  returnKeyType="search"
                />
              </View>
            </View>

            {/* Rarity picker */}
            <View className="mb-2 md:w-[220px] bg-slate-50 rounded-lg border border-slate-900/10 p-2">
              <Text className="font-bold mb-1.5 text-slate-900">Raridade</Text>
              <View className="rounded-lg overflow-hidden border border-slate-900/20 bg-slate-200/60 justify-center shadow-sm min-h-[42px]">
                <Picker
                  selectedValue={filters.rarity}
                  onValueChange={(val) =>
                    setFilters((f) => ({ ...f, rarity: val, page: 1 }))
                  }
                  style={{
                    width: "100%",
                    color: "#222",
                    backgroundColor: "transparent",
                    borderWidth: 0,
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
            <View className="mb-2 md:w-[220px] bg-slate-50 rounded-lg border border-slate-900/10 p-2">
              <Text className="font-bold mb-1.5 text-slate-900">Tipo</Text>
              <View className="rounded-lg overflow-hidden border border-slate-900/20 bg-slate-200/60 justify-center shadow-sm min-h-[42px]">
                <Picker
                  selectedValue={filters.type}
                  onValueChange={(val) =>
                    setFilters((f) => ({ ...f, type: val, page: 1 }))
                  }
                  style={{
                    width: "100%",
                    color: "#222",
                    backgroundColor: "transparent",
                    borderWidth: 0,
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
            <View className="mt-2 md:mt-0 ml-auto self-center">
              <Button onPress={clearFilters}>Limpar Filtros</Button>
            </View>
          </View>

          {/* Results */}
          {errorMsg ? (
            <Text className="text-red-500 mb-3">{errorMsg}</Text>
          ) : null}

          {loading ? (
            <View className="items-center p-6">
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
                      {
                        width: columns === 1 ? "100%" : itemWrapperWidth,
                        marginRight: columns === 1 ? 0 : isLastInRow ? 0 : GAP,
                        alignItems: columns === 1 ? "center" : "flex-start",
                        paddingVertical: 8,
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
                { paddingBottom: 40, paddingTop: 6 },
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
            <View className="items-center p-6">
              <Text className="text-4xl mb-2">🔍</Text>
              <Text className="text-lg font-bold">Nenhum item encontrado</Text>
              <Text className="text-slate-500 mb-3">
                Tente ajustar os filtros
              </Text>
              <Button onPress={clearFilters} style={{ marginTop: 12 }}>
                Limpar Filtros
              </Button>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
import FilterCard from "@/components/search/FiltersCard";
import ResultsGrid from "@/components/search/ResultsGrid";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import Navigation from "../components/Navigation";
import { getItems } from "../hooks/itens/item";
import {
  getLikesByUser,
  getLikesForItem,
  toggleItemLike,
} from "../hooks/itens/itemLike";
import { Item, ItemFilters } from "../interface/Item";
import { useAuth } from "../utils/AuthContext";

const HORIZONTAL_PADDING = 32; // container left+right padding (16 + 16)

const GAP = 12;
const MIN_CARD_WIDTH = 160;

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
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width
  );

  useEffect(() => {
    const handler = ({ window }: { window: { width: number } }) =>
      setWindowWidth(window.width);
    const sub = Dimensions.addEventListener?.("change", handler);
    return () => sub?.remove?.();
  }, []);

  const WIN = Dimensions.get("window");
  const columns = useMemo(() => {
    const available = Math.max(0, windowWidth - HORIZONTAL_PADDING);
    const cols = Math.floor(available / MIN_CARD_WIDTH) || 1;
    return Math.min(Math.max(cols, 1), 4);
  }, [windowWidth]);

  const itemWrapperWidth = useMemo(() => {
    const totalGap = GAP * (columns - 1);
    const available = Math.max(
      0,
      Math.min(windowWidth, WIN.width) - HORIZONTAL_PADDING - totalGap
    );
    return Math.floor(available / columns);
  }, [WIN.width, columns, windowWidth]);

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
        const userId =
          typeof token === "string" && token && user?.id ? user.id : null;
        const likesPromises = allItems.map((item) =>
          getLikesForItem(item.id).catch(() => 0)
        );
        const likesResults = await Promise.all(likesPromises);
        let userLikesArr: any[] = [];
        if (token && userId) {
          try {
            userLikesArr = await getLikesByUser(userId, token);
            if (!Array.isArray(userLikesArr)) userLikesArr = [];
          } catch {
            userLikesArr = [];
          }
        }
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

  async function handleLike(id: number) {
    if (!token || !user?.id) {
      console.warn("Token ou user.id ausente, não é possível dar like");
      return;
    }
    try {
      const res = await toggleItemLike(id, token);
      setItemLikes((prev) => {
        const prevState = prev[id] || { likes: 0, isLiked: false };
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

  if (items.length > 0) {
    return (
      <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
        <Navigation />
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          // usa colunas calculadas dinamicamente
          numColumns={columns}
          // ajusta espaçamento horizontal entre colunas
          columnWrapperStyle={{
            justifyContent: "space-between",
            paddingHorizontal: HORIZONTAL_PADDING / 2,
          }}
          ListHeaderComponent={
            <>
              <View className="items-center mb-4 md:mb-6 mt-3 md:mt-7">
                <Text className="text-2xl md:text-3xl font-extrabold">
                  Buscar Itens
                </Text>
                <Text className="text-slate-500 mt-1.5">
                  Encontre o item perfeito para sua aventura
                </Text>
              </View>
              <FilterCard
                filters={filters}
                setFilters={setFilters}
                clearFilters={clearFilters}
                RARITIES={RARITIES}
                TYPES={TYPES}
              />
              {errorMsg ? (
                <Text className="text-red-500 mb-3">{errorMsg}</Text>
              ) : null}
              {loading ? (
                <View className="items-center p-6">
                  <ActivityIndicator size="large" />
                  <Text style={{ marginTop: 8 }}>Carregando itens...</Text>
                </View>
              ) : null}
            </>
          }
          // cada item fica dentro de um wrapper com largura fixa calculada
          renderItem={({ item }) => (
            <View style={{ width: itemWrapperWidth, marginBottom: GAP }}>
              <ResultsGrid
                items={[item]}
                itemLikes={itemLikes}
                handleLike={handleLike}
                navigation={navigation}
                columns={columns}
                itemWrapperWidth={itemWrapperWidth}
                GAP={GAP}
              />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      <Navigation />
      <View className="py-3 md:py-7">
        <View className="items-center mb-4 md:mb-6">
          <Text className="text-2xl md:text-3xl font-extrabold">
            Buscar Itens
          </Text>
          <Text className="text-slate-500 mt-1.5">
            Encontre o item perfeito para sua aventura
          </Text>
        </View>
        <FilterCard
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          RARITIES={RARITIES}
          TYPES={TYPES}
        />
        {errorMsg ? (
          <Text className="text-red-500 mb-3">{errorMsg}</Text>
        ) : null}
        {loading ? (
          <View className="items-center p-6">
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 8 }}>Carregando itens...</Text>
          </View>
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
      </View>
    </View>
  );
}

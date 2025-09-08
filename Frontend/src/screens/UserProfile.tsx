// UserProfile.tsx (atualizado para grid dinâmica)
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Text,
  View,
} from "react-native";

import Button from "../components/Button";
import ItemCard from "../components/ItemCard";
import Navigation from "../components/Navigation";
import { Item } from "../interface/Item";
import { User } from "../interface/User";
import { getLikesByUser, getLikesForItem } from "../hooks/itens/itemLike";
import api from "@/services/api";
import { useAuth } from "../utils/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import StatCard from "@/components/profile/StatCard";
import ItemsGridProfile from "@/components/profile/ItemsGridProfile";
import EmptyState from "@/components/profile/EmptyState";

const HORIZONTAL_PADDING = 32; // container padding left+right (16 each)
const GAP = 12; // gap between cards
const MIN_CARD_WIDTH = 160;
const WIN = Dimensions.get("window");

type RootStackParamList = {
  Home: undefined;
  UserProfile: { userId?: number };
  ItemDetails: { id: number };
};

type UserProfileNavigationProp = StackNavigationProp<
  RootStackParamList,
  "UserProfile"
>;
type UserProfileRouteProp = RouteProp<RootStackParamList, "UserProfile">; // ajuste este valor para controlar quantos cabem

export default function UserProfile() {
  const navigation = useNavigation<UserProfileNavigationProp>();
  const route = useRoute<UserProfileRouteProp>();
  const routeUserId = route?.params?.userId;
  const { user: authUser } = useAuth();
  const insets = useSafeAreaInsets();

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
  // INÍCIO COMPONENTE: FetchUserData
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
  // FIM COMPONENTE: FetchUserData

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
    // INÍCIO COMPONENTE: OnRefreshHandler
    setRefreshing(true);
    try {
      const idToFetch = routeUserId ?? authUser?.id;
      if (idToFetch) await fetchUserData(Number(idToFetch));
    } finally {
      setRefreshing(false);
    }
  }, [routeUserId, authUser, fetchUserData]);
  // FIM COMPONENTE: OnRefreshHandler

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-slate-50">
        {/* INÍCIO COMPONENTE: LoadingState */}
        <ActivityIndicator size="large" color="#6d28d9" />
        {/* FIM COMPONENTE: LoadingState */}
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        {/* INÍCIO COMPONENTE: NavigationBar */}
        <Navigation />
        {/* FIM COMPONENTE: NavigationBar */}
        <View className="flex-1 justify-center items-center">
          {/* INÍCIO COMPONENTE: ErrorCard */}
          <View className="bg-white p-4 rounded-xl border border-red-100">
            <Text className="text-red-500 font-extrabold mb-2">
              {error ?? "Usuário não encontrado"}
            </Text>
            <Button onPress={() => navigation.navigate("Home")}>
              Voltar ao Início
            </Button>
          </View>
          {/* FIM COMPONENTE: ErrorCard */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    // INÍCIO COMPONENTE: ScreenContainer
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      {/* INÍCIO COMPONENTE: NavigationBar */}
      <Navigation />
      {/* FIM COMPONENTE: NavigationBar */}
      {/* INÍCIO COMPONENTE: ContentContainer */}
      <View className="flex-1 p-4">
        {/* INÍCIO COMPONENTE: ProfileHeaderCard */}
        <ProfileHeaderCard user={user} />
        {/* FIM COMPONENTE: ProfileHeaderCard */}

        {/* INÍCIO COMPONENTE: StatsRow */}
        <StatCard userItems={userItems} userLikesTotal={userLikesTotal} />
        {/* FIM COMPONENTE: StatsRow */}

        {/* INÍCIO COMPONENTE: SectionHeader */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-extrabold text-slate-900">
            Itens Criados por {user.name || "Usuário"}
          </Text>
          <Text className="text-slate-500">
            {userItems.length} {userItems.length === 1 ? "item" : "itens"}
          </Text>
        </View>
        {/* FIM COMPONENTE: SectionHeader */}

        {itemsWithLikes.length > 0 ? (
          // INÍCIO COMPONENTE: ItemsGrid
          <ItemsGridProfile
            itemsWithLikes={itemsWithLikes}
            ItemCard={ItemCard}
            navigation={navigation}
            refreshing={refreshing}
            onRefresh={onRefresh}
            itemWidth={itemWidth}
            columns={columns}
            GAP={GAP}
          />
          // FIM COMPONENTE: ItemsGrid
        ) : (
          <EmptyState user={user} />
        )}
      </View>
      {/* FIM COMPONENTE: ContentContainer */}
    </View>
    // FIM COMPONENTE: ScreenContainer
  );
}

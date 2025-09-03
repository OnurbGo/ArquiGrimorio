import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Navigation from "../components/Navigation";

import type { Item } from "../interface/Item";
import type { RootStackParamList } from "../navigation/Routes";
import api, {
  getLikesByUser,
  getLikesForItem,
  toggleItemLike,
} from "../services/api";
import { useAuth } from "../utils/AuthContext";

type ItemDetailsRouteProp = RouteProp<RootStackParamList, "ItemDetails">;

type ItemWithExtras = Item & {
  likes?: number;
  isLiked?: boolean;
  creator?: { name?: string; url_img?: string };
  image_url?: string;
};

export default function ItemDetails() {
  const route = useRoute<ItemDetailsRouteProp>();
  const { token, user: authUser } = useAuth();

  // garantir número mesmo que venha string por deep-link
  const rawId = route.params?.id as unknown;
  const id =
    rawId == null
      ? undefined
      : typeof rawId === "string"
      ? Number(rawId)
      : rawId;

  const [item, setItem] = useState<ItemWithExtras | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id == null || Number.isNaN(id)) {
      setError("ID do item inválido");
      setLoading(false);
      return;
    }

    let active = true;

    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await api.get(`/item/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!active) return;
        const data = resp.data as ItemWithExtras;

        // Buscar likes e estado de like
        let likes = 0;
        let isLiked = false;
        try {
          likes = await getLikesForItem(Number(id));
          if (token && authUser && authUser.id) {
            const userLikes = await getLikesByUser(authUser.id, token);
            isLiked = userLikes.some((like: any) => like.item_id === id);
          }
        } catch {}

        setItem({ ...data, likes, isLiked });
      } catch (err: any) {
        console.error("ItemDetails fetch error:", err);
        // intenta pegar mensagem do servidor ou usa mensagem genérica
        const msg = err?.message ?? "Erro ao buscar item";
        if (active) setError(msg);
      } finally {
        active && setLoading(false);
      }
    };

    fetchItem();

    return () => {
      active = false;
    };
  }, [id, token, authUser]);

  const [likeLoading, setLikeLoading] = useState(false);
  async function handleLikeToggle(itemId: number) {
    if (!token || likeLoading) return;
    setLikeLoading(true);
    try {
      await toggleItemLike(itemId, token);
      setItem((prev) => {
        if (!prev) return prev;
        const isLiked = !prev.isLiked;
        const likes = isLiked ? (prev.likes ?? 0) + 1 : (prev.likes ?? 0) - 1;
        return { ...prev, isLiked, likes };
      });
    } catch (err: any) {
      console.error("Erro ao curtir/descurtir:", err);
    } finally {
      setLikeLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0a1747",
          paddingTop: "7%",
        }}
      >
        <ActivityIndicator size="large" color="#7f32cc" />
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#0a1747", paddingTop: "7%" }}
      >
        <View className="flex-1 items-center justify-center p-6">
          <View className="bg-card p-4 rounded-xl border border-border">
            <Text className="text-destructive font-semibold">
              {error ?? "Item não encontrado"}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const priceText =
    item.price != null
      ? `${Number(item.price).toLocaleString("pt-BR")} mo`
      : "—";

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Navigation />
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} className="pb-8">
          <View className="px-4">
            {/* Informações detalhadas do item */}
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
                marginBottom: 16,
              }}
            >
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.heroImage}
                  resizeMode="contain"
                />
              ) : null}
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  color: "#111827",
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                {item.name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <Text
                  style={{
                    backgroundColor: "#e5e7eb",
                    color: "#374151",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: "500",
                    marginRight: 6,
                  }}
                >
                  {item.rarity}
                </Text>
                <Text
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                    fontSize: 12,
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    color: "#374151",
                  }}
                >
                  {item.type}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  color: "#6b7280",
                  textAlign: "center",
                  marginTop: 12,
                }}
              >
                {item.description || "—"}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#1f2937",
                  marginTop: 16,
                }}
              >
                Preço
              </Text>
              <Text style={{ fontSize: 16, color: "#374151", marginTop: 4 }}>
                {priceText}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 16,
                }}
              >
                <TouchableOpacity
                  onPress={() => handleLikeToggle(item.id!)}
                  disabled={likeLoading}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: likeLoading ? "#e5e7eb" : "#f3f4f6",
                    marginRight: 8,
                    opacity: likeLoading ? 0.6 : 1,
                  }}
                >
                  <Text
                    style={{
                      color: item.isLiked ? "#dc2626" : "#374151",
                      fontSize: 16,
                    }}
                  >
                    ♥ {item.likes ?? 0}
                  </Text>
                </TouchableOpacity>
              </View>
              {item.creator && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 20,
                    justifyContent: "center",
                  }}
                >
                  {item.creator.url_img ? (
                    <Image
                      source={{ uri: item.creator.url_img }}
                      style={styles.creatorImg}
                    />
                  ) : (
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#e5e7eb",
                        marginRight: 12,
                      }}
                    />
                  )}
                  <Text style={{ color: "#6b7280", fontSize: 15 }}>
                    {item.creator.name || "Desconhecido"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  heroImage: { width: "100%", height: 220, borderRadius: 10, marginTop: 6 },
  creatorImg: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
});

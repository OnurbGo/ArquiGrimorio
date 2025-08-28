// src/components/ItemDetails.tsx
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Item } from "../interface/Item";
import type { RootStackParamList } from "../navigation/Routes";
import api from "../services/api";
import { useAuth } from "../utils/AuthContext";
import { Button } from "./Button";
import ItemCard from "./ItemCard";

type ItemDetailsRouteProp = RouteProp<RootStackParamList, "ItemDetails">;
type ItemDetailsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ItemDetails"
>;

type ItemWithExtras = Item & {
  likes?: number;
  isLiked?: boolean;
  creator?: { name?: string; url_img?: string };
  image_url?: string;
};

export default function ItemDetails() {
  const route = useRoute<ItemDetailsRouteProp>();
  const navigation = useNavigation<ItemDetailsNavigationProp>();
  const { token } = useAuth();

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
        setItem(data);
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
  }, [id, token]);

  function handleLikeToggle(itemId: number) {
    setItem((prev) => {
      if (!prev) return prev;
      const liked = !prev.isLiked;
      const prevLikes = typeof prev.likes === "number" ? prev.likes : 0;
      return {
        ...prev,
        isLiked: liked,
        likes: liked ? prevLikes + 1 : Math.max(prevLikes - 1, 0),
      };
    });

    // opcional: enviar requisição ao backend para alternar like
    // api.post(`/item/${itemId}/like`, {}, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7f32cc" />
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="p-4">
          <Button onPress={() => navigation.goBack()}>Voltar</Button>
        </View>

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
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-4">
        <Button onPress={() => navigation.goBack()}>Voltar</Button>
      </View>

      <ScrollView contentContainerStyle={styles.container} className="pb-8">
        <View className="px-4">
          {/* Card principal (reaproveita ItemCard com tema) */}
          <ItemCard
            item={item}
            onLike={() => handleLikeToggle(item.id!)}
            onView={() => {}}
          />

          {/* Detalhes */}
          <View className="mt-4 bg-card p-4 rounded-2xl border border-border shadow-elevated">
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.heroImage}
              />
            ) : null}

            <Text className="text-foreground font-semibold text-lg mt-3">
              Descrição
            </Text>
            <Text className="text-muted-foreground mt-2">
              {item.description || "—"}
            </Text>

            <Text className="text-foreground font-semibold text-lg mt-4">
              Preço
            </Text>
            <Text className="text-muted-foreground mt-2">{priceText}</Text>

            {item.creator && (
              <>
                <Text className="text-foreground font-semibold text-lg mt-4">
                  Criador
                </Text>
                <View className="flex-row items-center mt-2">
                  {item.creator.url_img ? (
                    <Image
                      source={{ uri: item.creator.url_img }}
                      style={styles.creatorImg}
                    />
                  ) : (
                    <View className="w-10 h-10 rounded-full bg-muted mr-3" />
                  )}
                  <Text className="text-muted-foreground">
                    {item.creator.name || "Desconhecido"}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  heroImage: { width: "100%", height: 220, borderRadius: 10, marginTop: 6 },
  creatorImg: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
});

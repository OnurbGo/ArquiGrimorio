// ItemCard.tsx — name allowed 2 linhas, descrição truncada, imagem sem corte, cards uniformes
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Item } from "../interface/Item";
import { toggleItemLike } from "../hooks/itens/itemLike";
import { useAuth } from "../utils/AuthContext";

type ItemWithExtras = Item & {
  likes?: number;
  isLiked?: boolean;
  creator?: { name?: string; url_img?: string };
  image_url?: string;
};

interface Props {
  item: ItemWithExtras;
  onView?: (id: number) => void;
  onLike?: (id: number) => void;
}

/* Ajustáveis */
const DESCRIPTION_LINES = 3; // linhas da descrição antes de "..."
const CARD_HEIGHT = 320; // altura fixa do card (uniformiza grid)
const IMAGE_HEIGHT = 110; // altura da imagem dentro do card
/* --------- */

const rarityColors: Record<string, { backgroundColor: string; color: string }> =
  {
    comum: { backgroundColor: "#e5e7eb", color: "#374151" },
    incomum: { backgroundColor: "#bbf7d0", color: "#166534" },
    raro: { backgroundColor: "#3b82f6", color: "#fff" },
    épico: { backgroundColor: "#7c3aed", color: "#fff" },
    lendário: { backgroundColor: "#facc15", color: "#000" },
  };

export default function ItemCard({ item, onView, onLike }: Props) {
  const { token } = useAuth();
  const [localItem, setLocalItem] = useState<ItemWithExtras>(item);

  useEffect(() => {
    setLocalItem(item);
  }, [item]);

  const rarityKey = String(localItem.rarity ?? "").toLowerCase();
  const rarityStyle = rarityColors[rarityKey] ?? rarityColors.comum;
  const priceText =
    localItem.price != null
      ? `${Number(localItem.price).toLocaleString("pt-BR")} mo`
      : "—";
  const creatorName = localItem.creator?.name || "Desconhecido";

  async function handleLike() {
    if (onLike) {
      // optimistic local update (pai persistirá)
      setLocalItem((prev) => {
        const isLiked = !prev.isLiked;
        const likes = isLiked
          ? (prev.likes ?? 0) + 1
          : Math.max((prev.likes ?? 0) - 1, 0);
        return { ...prev, isLiked, likes };
      });
      try {
        onLike(localItem.id);
      } catch (err) {
        console.error("Erro delegando like ao pai:", err);
      }
      return;
    }

    if (!token) {
      console.warn("Token ausente, não é possível dar like");
      return;
    }
    try {
      const updated = await toggleItemLike(localItem.id, token);
      setLocalItem((prev) => ({
        ...prev,
        isLiked:
          typeof updated?.liked === "boolean" ? updated.liked : !prev.isLiked,
        likes:
          typeof updated?.totalLikes === "number"
            ? updated.totalLikes
            : prev.isLiked
            ? Math.max((prev.likes ?? 0) - 1, 0)
            : (prev.likes ?? 0) + 1,
      }));
    } catch (err) {
      console.error("Erro ao dar like:", err);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        {localItem.image_url ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: localItem.image_url }}
              style={styles.image}
              resizeMode="contain" // evita corte
            />
          </View>
        ) : (
          <View style={[styles.imageContainer, styles.imagePlaceholder]} />
        )}

        {/* name agora pode quebrar em até 2 linhas (não é cortado em 1 linha) */}
        <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
          {localItem.name}
        </Text>

        <View style={styles.row}>
          <Text
            style={[
              styles.rarity,
              {
                backgroundColor: rarityStyle.backgroundColor,
                color: rarityStyle.color,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {localItem.rarity}
          </Text>
          <Text style={styles.type} numberOfLines={1} ellipsizeMode="tail">
            {localItem.type}
          </Text>
        </View>

        <Text
          style={styles.description}
          numberOfLines={DESCRIPTION_LINES}
          ellipsizeMode="tail"
        >
          {localItem.description}
        </Text>

        <Text style={styles.price}>{priceText}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.creator} numberOfLines={1} ellipsizeMode="tail">
          por {creatorName}
        </Text>

        <View style={styles.footerActions}>
          <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
            <Text style={{ color: localItem.isLiked ? "#dc2626" : "#374151" }}>
              ♥ {localItem.likes ?? 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onView?.(localItem.id)}
            style={styles.viewButton}
          >
            <Text style={{ color: "#2563eb" }}>Ver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "stretch",
    justifyContent: "space-between", // garante footer na base
  },

  content: {
    flexShrink: 1,
  },

  imageContainer: {
    width: "100%",
    height: IMAGE_HEIGHT,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  imagePlaceholder: { backgroundColor: "#f1f5f9" },
  image: {
    width: "100%",
    height: "100%",
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    lineHeight: 18,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  rarity: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "600",
    marginRight: 8,
  },
  type: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    color: "#374151",
  },

  description: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 6,
  },

  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eef2f6",
    paddingTop: 8,
    marginTop: 6,
  },

  creator: {
    fontSize: 12,
    color: "#6b7280",
    flex: 1,
  },

  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },

  likeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },

  viewButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#eaf2ff",
  },
});

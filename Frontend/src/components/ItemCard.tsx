import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Item } from "../interface/Item";
import { toggleItemLike } from "../services/api";
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
  const rarityKey = String(localItem.rarity ?? "").toLowerCase();
  const rarityStyle = rarityColors[rarityKey] ?? rarityColors.comum;
  const priceText =
    localItem.price != null
      ? `${Number(localItem.price).toLocaleString("pt-BR")} mo`
      : "—";
  const creatorName = localItem.creator?.name || "Desconhecido";

  async function handleLike() {
    if (!token) return;
    try {
      const updated = await toggleItemLike(localItem.id, token);
      setLocalItem((prev) => ({ ...prev, ...updated }));
      onLike?.(localItem.id);
    } catch {}
  }

  return (
    <View style={styles.card}>
      {localItem.image_url && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: localItem.image_url }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      )}
      <Text style={styles.name}>{localItem.name}</Text>
      <View style={styles.row}>
        <Text
          style={[
            styles.rarity,
            {
              backgroundColor: rarityStyle.backgroundColor,
              color: rarityStyle.color,
            },
          ]}
        >
          {localItem.rarity}
        </Text>
        <Text style={styles.type}>{localItem.type}</Text>
      </View>
      <Text style={styles.description}>{localItem.description}</Text>
      <Text style={styles.price}>{priceText}</Text>
      <View style={styles.footer}>
        <Text style={styles.creator}>por {creatorName}</Text>
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
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: "center",
  },
  imageContainer: {
    width: "50%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  rarity: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "500",
    marginRight: 6,
  },
  type: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    color: "#374151",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  creator: {
    fontSize: 12,
    color: "#6b7280",
    flex: 1,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    marginRight: 4,
  },
  viewButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#e0e7ff",
  },
});

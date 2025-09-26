// ItemCard.tsx — name allowed 2 linhas, descrição truncada, imagem sem corte, cards uniformes
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { toggleItemLike } from "../hooks/itens/itemLike";
import type { Item } from "../interface/Item";
import { useAuth } from "../utils/AuthContext";

const DESCRIPTION_LINES = 3; // linhas da descrição antes de "..."
const CARD_HEIGHT = 320; // altura fixa do card (uniformiza grid)
const IMAGE_HEIGHT = 110; // altura da imagem dentro do card

const rarityClasses: Record<string, string> = {
  comum: "bg-gray-200 text-gray-800",
  incomum: "bg-green-200 text-green-800",
  raro: "bg-blue-500 text-white",
  "muito-raro": "bg-purple-600 text-white",
  lendario: "bg-yellow-400 text-black",
  artefato: "bg-amber-500 text-white",
};

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

export default function ItemCard({ item, onView, onLike }: Props) {
  const { token } = useAuth();
  const [localItem, setLocalItem] = useState<ItemWithExtras>(item);

  useEffect(() => {
    setLocalItem(item);
  }, [item]);

  const rarityKey = String(localItem.rarity ?? "").toLowerCase();
  const rarityClassName = rarityClasses[rarityKey] ?? rarityClasses.comum;
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
    <View
      className="bg-white rounded-xl p-3 mb-3 shadow-sm items-stretch justify-between"
      style={{ height: CARD_HEIGHT }}
    >
      <View className="flex-shrink">
        {localItem.image_url ? (
          <View
            className="w-full rounded-lg overflow-hidden border border-gray-200 mb-2 items-center justify-center bg-slate-50"
            style={{ height: IMAGE_HEIGHT }}
          >
            <Image
              source={{ uri: localItem.image_url }}
              style={{
                width: "100%",
                height: "100%",
                maxHeight: IMAGE_HEIGHT,
                maxWidth: "100%",
                objectFit: "contain",
              }}
              resizeMode="contain"
              // Não remove a imagem do estado, apenas loga o erro
              onError={() => {
                // Se quiser mostrar um fallback visual, pode setar um flag de erro aqui
                // mas não apaga a image_url para sempre tentar mostrar
                // Exemplo: setLocalItem((prev) => ({ ...prev, imageError: true }));
              }}
            />
          </View>
        ) : (
          <View
            className="w-full rounded-lg overflow-hidden border border-gray-200 mb-2 items-center justify-center bg-slate-100"
            style={{ height: IMAGE_HEIGHT }}
          >
            <Text style={{ color: "#888", fontSize: 16 }}>Sem imagem</Text>
          </View>
        )}

        {/* name agora pode quebrar em até 2 linhas (não é cortado em 1 linha) */}
        <Text
          className="text-base font-bold text-gray-900 mb-1.5 leading-tight"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {localItem.name}
        </Text>

        <View className="flex-row items-center mb-1.5">
          <Text
            className={`px-2 py-1 rounded-md text-xs font-semibold mr-2 ${rarityClassName}`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {localItem.rarity}
          </Text>
          <Text
            className="px-2 py-1 rounded-md text-xs border border-gray-300 text-gray-700"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {localItem.type}
          </Text>
        </View>

        <Text
          className="text-sm text-gray-500 leading-snug mb-1.5"
          numberOfLines={DESCRIPTION_LINES}
          ellipsizeMode="tail"
        >
          {localItem.description}
        </Text>

        <Text className="text-sm font-bold text-gray-800 mb-1.5">
          {priceText}
        </Text>
      </View>

      <View className="flex-row items-center justify-between border-t border-slate-100 pt-2 mt-1.5">
        <Text
          className="text-xs text-gray-500 flex-1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          por {creatorName}
        </Text>

        <View className="flex-row items-center ml-2">
          <TouchableOpacity
            onPress={handleLike}
            className="px-2.5 py-1.5 rounded-lg bg-gray-100 mr-2"
          >
            <Text style={{ color: localItem.isLiked ? "#dc2626" : "#374151" }}>
              ♥ {localItem.likes ?? 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onView?.(localItem.id)}
            className="px-2.5 py-1.5 rounded-lg bg-blue-100"
          >
            <Text className="text-blue-600">Ver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

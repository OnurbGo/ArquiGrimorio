import { Pen } from "lucide-react-native";
import {
  GestureResponderEvent,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Item } from "../interface/Item";

interface Props {
  item: Item;
  onEdit: (item: Item) => void; // aberto como modal pela tela pai
  onDelete: (id: number) => void; // usado caso queira deletar direto do card
}

/**
 * Cartão usado na lista de edição de itens (visual escuro).
 * - Exibe image_url com mais espaço e resizeMode contain (imagem aparece completa).
 * - Chama onEdit(item) para abrir modal de edição (pai decide o que fazer).
 */
export default function ItemCardEdit({ item, onEdit }: Props) {
  const thumb = item.image_url || null;

  const handleEdit = (e?: GestureResponderEvent) => {
    onEdit(item);
  };

  return (
    <View className="flex-row bg-[#23234a] rounded-xl p-3 my-2 mx-1.5 border border-[#7f32cc] overflow-hidden items-start">
      {thumb ? (
        <View className="w-[140px] h-[140px] rounded-lg overflow-hidden mr-3 bg-[#1f1f33] items-center justify-center border border-[#2b2b45]">
          <Image
            source={{ uri: thumb }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>
      ) : (
        <View className="w-[140px] h-[140px] rounded-lg overflow-hidden mr-3 bg-[#191923] items-center justify-center border border-[#2b2b45]">
          <Text className="text-[#dcd6ff] text-3xl font-extrabold">
            {(item.name || "").slice(0, 1).toUpperCase()}
          </Text>
        </View>
      )}

      <View className="flex-1 justify-between">
        <Text
          className="text-white text-base font-extrabold mb-1.5"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>

        <View className="flex-row items-center gap-2 mb-1.5">
          <Text
            className="px-2 py-1 rounded-lg bg-[#7f32cc] text-white font-bold text-xs"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.rarity}
          </Text>
          <Text
            className="px-2 py-1 rounded-lg bg-[#2b2b45] text-[#d1cfe8] text-xs font-semibold"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.type}
          </Text>
          <Text
            className="ml-auto text-[#d1cfe8] text-xs font-bold"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.price != null
              ? `${Number(item.price).toLocaleString("pt-BR")} mo`
              : "—"}
          </Text>
        </View>

        {item.description ? (
          <Text
            className="text-[#d1cfe8] text-sm mb-2"
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {item.description}
          </Text>
        ) : null}

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleEdit}
            className="flex-row items-center py-2 px-3 rounded-lg bg-[#3a3a5a] mr-2"
            activeOpacity={0.8}
          >
            <Pen size={14} color="#fff" />
            <Text className="text-white ml-2 font-bold text-sm">Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

import { Pen } from "lucide-react-native";
import {
  GestureResponderEvent,
  Image,
  StyleSheet,
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
    <View style={styles.card}>
      {thumb ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: thumb }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View style={[styles.imageContainer, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>
            {(item.name || "").slice(0, 1).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
          {item.name}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.rarity} numberOfLines={1} ellipsizeMode="tail">
            {item.rarity}
          </Text>
          <Text style={styles.type} numberOfLines={1} ellipsizeMode="tail">
            {item.type}
          </Text>
          <Text style={styles.price} numberOfLines={1} ellipsizeMode="tail">
            {item.price != null
              ? `${Number(item.price).toLocaleString("pt-BR")} mo`
              : "—"}
          </Text>
        </View>

        {item.description ? (
          <Text
            style={styles.description}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {item.description}
          </Text>
        ) : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.editBtn}
            activeOpacity={0.8}
          >
            <Pen size={14} />
            <Text style={styles.btnText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#23234a",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#7f32cc",
    overflow: "hidden",
    alignItems: "flex-start",
  },

  // AUMENTEI a área da imagem para exibir melhor (comparado à versão anterior)
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "#1f1f33",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2b2b45",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    backgroundColor: "#191923",
  },

  placeholderText: {
    color: "#dcd6ff",
    fontSize: 28,
    fontWeight: "800",
  },

  content: {
    flex: 1,
    justifyContent: "space-between",
  },

  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  rarity: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#7f32cc",
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  type: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#2b2b45",
    color: "#d1cfe8",
    fontSize: 12,
    fontWeight: "600",
  },

  price: {
    marginLeft: "auto",
    color: "#d1cfe8",
    fontSize: 12,
    fontWeight: "700",
  },

  description: {
    color: "#d1cfe8",
    fontSize: 13,
    marginBottom: 8,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#3a3a5a",
    marginRight: 8,
  },

  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#ef4444",
  },

  btnText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "700",
    fontSize: 13,
  },
});

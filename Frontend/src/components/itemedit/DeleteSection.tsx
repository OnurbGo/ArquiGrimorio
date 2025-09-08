import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

export default function DeleteSection({
  editingItem,
  setEditingItem,
  deleteItem,
  setItems,
  saving,
  deleting,
  setDeleting,
}: any) {
  return (
    <View>
      <View style={{ marginTop: 12 }}>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Excluir item",
              "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Sim, excluir",
                  style: "destructive",
                  onPress: async () => {
                    if (!editingItem) return;
                    try {
                      setDeleting(true);
                      await deleteItem(editingItem.id);
                      setItems((prev: any) =>
                        prev.filter((i: any) => i.id !== editingItem.id)
                      );
                      setEditingItem(null);
                    } catch (err: any) {
                      Alert.alert(
                        "Erro",
                        err?.message || "Não foi possível excluir o item."
                      );
                    } finally {
                      setDeleting(false);
                    }
                  },
                },
              ]
            )
          }
          className="mt-1.5 bg-[#ef4444] py-2.5 rounded-lg items-center"
          disabled={saving || deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-extrabold">Excluir item</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

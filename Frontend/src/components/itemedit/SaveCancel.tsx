import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";

export default function SaveCancel( {handleSave, saving, deleting, setEditingItem}: any) {
  return (
    <View>
      <View className="flex-row justify-end gap-2 mt-3">
                      <TouchableOpacity
                        onPress={() => setEditingItem(null)}
                        className="px-3.5 py-2.5 rounded-lg min-w-[96px] items-center bg-[#2b2b45]"
                        disabled={saving || deleting}
                      >
                        <Text className="text-white font-bold">Cancelar</Text>
                      </TouchableOpacity>
      
                      <TouchableOpacity
                        onPress={handleSave}
                        className="px-3.5 py-2.5 rounded-lg min-w-[96px] items-center bg-[#7f32cc]"
                        disabled={saving || deleting}
                      >
                        {saving ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text className="text-white font-bold">Salvar</Text>
                        )}
                      </TouchableOpacity>
                    </View>
    </View>
  );
}
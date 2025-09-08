import { Text, TextInput, View } from "react-native";


export default function LabeledDesc({ formData, setFormData }: any) {
  return (
    <View>
      <Text className="text-sm lg:text-lg font-bold text-theme-text mb-1.5 mt-2">Descrição</Text>
                  <TextInput
                    className="bg-cardBg rounded-lg p-3 text-base lg:text-lg text-theme-text mb-2 border border-white/5 h-20 lg:h-40"
                    placeholder="Descrição"
                    placeholderTextColor="#9ca3af"
                    value={formData.description}
                    multiline
                    onChangeText={(text) =>
                      setFormData({ ...formData, description: text })
                    }
                  />
    </View>
  );
}

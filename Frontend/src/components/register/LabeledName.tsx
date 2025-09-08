import { Text, TextInput, View } from "react-native";

export default function LabeledName( { formData, setFormData }: any ) {
    return (
    <View>
      <Text className="text-sm lg:text-lg font-bold text-theme-text mb-1.5 mt-2">
        Nome
      </Text>
      <TextInput
        className="bg-cardBg rounded-lg p-3 text-base lg:text-lg text-theme-text mb-2 border border-white/5"
        placeholder="Nome"
        placeholderTextColor="#9ca3af"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />
    </View>
  );
}

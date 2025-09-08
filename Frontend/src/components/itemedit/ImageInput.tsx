import { Text, View, TextInput } from "react-native";

export default function ImageInput({
  form,
  setForm,
}: {
  form: any;
  setForm: any;
}) {
  return (
    <View>
      <Text className="text-[#d1cfe8] mb-1.5 mt-1.5 font-semibold">
        URL da imagem
      </Text>
      <TextInput
        value={form.image_url}
        onChangeText={(t) => setForm((s: any) => ({ ...s, image_url: t }))}
        className="bg-[#0f0f1a] border border-[#2b2b45] text-white px-3 py-2 rounded-lg"
        placeholder="https://..."
        placeholderTextColor="#8a87a8"
        autoCapitalize="none"
      />
    </View>
  );
}

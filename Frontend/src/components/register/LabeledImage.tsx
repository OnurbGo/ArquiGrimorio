import { Text, TextInput, View } from "react-native";

export default function LabeledImage({ formData, setFormData }: any) {
  return (
    <View>
      <Text className="text-sm lg:text-lg font-bold text-theme-text mb-1.5 mt-2">
        URL da Imagem
      </Text>
      <TextInput
        className="bg-cardBg rounded-lg p-3 text-base lg:text-lg text-theme-text mb-2 border border-white/5"
        placeholder="URL da imagem"
        placeholderTextColor="#9ca3af"
        value={formData.url_img}
        onChangeText={(text: any) =>
          setFormData({ ...formData, url_img: text })
        }
      />
    </View>
  );
}

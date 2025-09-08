import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Button from "../components/Button";
import Navigation from "../components/Navigation";
import type { Item } from "../interface/Item";
import { createItem } from "../hooks/itens/item";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RootStackParamList = {
  Home: undefined;
};

const RARITIES = [
  { value: "comum", label: "Comum" },
  { value: "incomum", label: "Incomum" },
  { value: "raro", label: "Raro" },
  { value: "muito-raro", label: "Muito Raro" },
  { value: "lendario", label: "Lendário" },
  { value: "artefato", label: "Artefato" },
];

const ITEM_TYPES = [
  { value: "arma", label: "Arma" },
  { value: "armadura", label: "Armadura" },
  { value: "escudo", label: "Escudo" },
  { value: "pergaminho", label: "Pergaminho" },
  { value: "pocao", label: "Poção" },
  { value: "anel", label: "Anel" },
  { value: "amuleto", label: "Amuleto" },
  { value: "varinha", label: "Varinha" },
  { value: "cajado", label: "Cajado" },
  { value: "outros", label: "Outros" },
];

export default function CreateItem() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rarity: "",
    type: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.rarity ||
      !formData.type ||
      !formData.description.trim()
    ) {
      Alert.alert(
        "Erro",
        "Preencha os campos obrigatórios (nome, raridade, tipo e descrição)."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const priceParsed = formData.price
        ? Number(String(formData.price).replace(",", "."))
        : undefined;
      const payload: Partial<Item> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        rarity: formData.rarity,
        type: formData.type,
        price:
          typeof priceParsed === "number" && !Number.isNaN(priceParsed)
            ? priceParsed
            : undefined,
        image_url: formData.imageUrl ? formData.imageUrl.trim() : undefined,
      };

      const created = await createItem(payload as Item);
      Alert.alert("Sucesso", `Item "${created.name}" criado com sucesso!`);
      navigation.navigate("Home");
    } catch (err: any) {
      console.error("createItem error:", err);
      Alert.alert(
        "Erro",
        err?.message ?? "Erro ao criar item. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    !!formData.name.trim() &&
    !!formData.rarity &&
    !!formData.type &&
    !!formData.description.trim();

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-slate-50">
      {/* INÍCIO COMPONENTE: ScreenContainer */}
      <Navigation />
      {/* INÍCIO COMPONENTE: KeyboardAvoidingContainer */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* INÍCIO COMPONENTE: CenteredScrollContent */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            padding: 20,
            paddingBottom: 48,
          }}
        >
          {/* INÍCIO COMPONENTE: FormCard */}
          <View className="w-full max-w-3xl bg-white rounded-2xl p-4 border border-indigo-500/10 shadow-lg">
            {/* INÍCIO COMPONENTE: FormHeader */}
            <View className="flex-row items-center mb-3">
              <View className="w-14 h-14 rounded-xl bg-violet-900/10 items-center justify-center mr-3">
                <Text className="text-violet-700 font-extrabold text-xl">✦</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-extrabold text-slate-900">
                  Criar Novo Item Mágico
                </Text>
                <Text className="mt-1 text-slate-500">
                  Compartilhe suas criações com a comunidade
                </Text>
              </View>
            </View>
            {/* FIM COMPONENTE: FormHeader */}

            {/* Nome */}
            {/* INÍCIO COMPONENTE: LabeledInput (Nome do Item) */}
            <View className="w-full mb-3">
              <Text className="text-sm font-bold text-slate-900 mb-1.5">
                Nome do Item *
              </Text>
              <TextInput
                placeholder="Ex: Revolver Dourado"
                placeholderTextColor="#9ca3af"
                value={formData.name}
                onChangeText={(t) => handleInputChange("name", t)}
                className="bg-slate-50 px-3 py-2 rounded-lg border border-indigo-100 text-slate-900"
              />
            </View>
            {/* FIM COMPONENTE: LabeledInput (Nome do Item) */}

            {/* Raridade e Tipo */}
            {/* INÍCIO COMPONENTE: Row (Raridade e Tipo) */}
            <View className="flex-row w-full mb-3">
              {/* INÍCIO COMPONENTE: PickerField (Raridade) */}
              <View className="flex-1 mr-2">
                <Text className="text-sm font-bold text-slate-900 mb-1.5">
                  Raridade *
                </Text>
                <View className="rounded-lg overflow-hidden border border-indigo-100 bg-indigo-50/50">
                  <Picker
                    selectedValue={formData.rarity}
                    onValueChange={(val) =>
                      handleInputChange("rarity", String(val))
                    }
                    style={{
                      width: "100%",
                      color: "#0f172a",
                      backgroundColor: "transparent",
                      borderWidth: 0,
                    }}
                    dropdownIconColor="#64748b"
                  >
                    <Picker.Item label="Selecione a raridade" value="" />
                    {RARITIES.map((r) => (
                      <Picker.Item
                        key={r.value}
                        label={r.label}
                        value={r.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              {/* FIM COMPONENTE: PickerField (Raridade) */}

              {/* INÍCIO COMPONENTE: PickerField (Tipo) */}
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900 mb-1.5">
                  Tipo *
                </Text>
                <View className="rounded-lg overflow-hidden border border-indigo-100 bg-indigo-50/50">
                  <Picker
                    selectedValue={formData.type}
                    onValueChange={(val) =>
                      handleInputChange("type", String(val))
                    }
                    style={{
                      width: "100%",
                      color: "#0f172a",
                      backgroundColor: "transparent",
                      borderWidth: 0,
                    }}
                    dropdownIconColor="#64748b"
                  >
                    <Picker.Item label="Selecione o tipo" value="" />
                    {ITEM_TYPES.map((t) => (
                      <Picker.Item
                        key={t.value}
                        label={t.label}
                        value={t.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              {/* FIM COMPONENTE: PickerField (Tipo) */}
            </View>
            {/* FIM COMPONENTE: Row (Raridade e Tipo) */}

            {/* Descrição */}
            {/* INÍCIO COMPONENTE: TextArea (Descrição e Efeitos) */}
            <View className="w-full mb-3">
              <Text className="text-sm font-bold text-slate-900 mb-1.5">
                Descrição e Efeitos *
              </Text>
              <TextInput
                placeholder="Descreva os efeitos mágicos, lore e características especiais do item..."
                placeholderTextColor="#9ca3af"
                value={formData.description}
                onChangeText={(t) => handleInputChange("description", t)}
                multiline
                className="bg-slate-50 px-3 py-2 rounded-lg border border-indigo-100 text-slate-900 h-32 align-top"
              />
            </View>
            {/* FIM COMPONENTE: TextArea (Descrição e Efeitos) */}

            {/* Preço e Imagem */}
            {/* INÍCIO COMPONENTE: Row (Preço e Imagem) */}
            <View className="flex-row w-full mb-3">
              {/* INÍCIO COMPONENTE: LabeledInput (Preço) */}
              <View className="flex-1 mr-2">
                <Text className="text-sm font-bold text-slate-900 mb-1.5">
                  Preço (Opcional)
                </Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  value={formData.price}
                  onChangeText={(t) => handleInputChange("price", t)}
                  className="bg-slate-50 px-3 py-2 rounded-lg border border-indigo-100 text-slate-900"
                />
              </View>
              {/* FIM COMPONENTE: LabeledInput (Preço) */}

              {/* INÍCIO COMPONENTE: LabeledInput (URL da Imagem) */}
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900 mb-1.5">
                  URL da Imagem (Opcional)
                </Text>
                <TextInput
                  placeholder="https://.../imagem.png"
                  placeholderTextColor="#9ca3af"
                  value={formData.imageUrl}
                  onChangeText={(t) => handleInputChange("imageUrl", t)}
                  className="bg-slate-50 px-3 py-2 rounded-lg border border-indigo-100 text-slate-900"
                />
              </View>
              {/* FIM COMPONENTE: LabeledInput (URL da Imagem) */}
            </View>
            {/* FIM COMPONENTE: Row (Preço e Imagem) */}

            {/* Prévia da imagem */}
            {/* INÍCIO COMPONENTE: ImagePreview */}
            {formData.imageUrl ? (
              <View className="w-full mb-3">
                <Text className="text-sm font-bold text-slate-900 mb-1.5">
                  Prévia da Imagem
                </Text>
                <View className="rounded-lg overflow-hidden border border-indigo-100 bg-slate-100">
                  <Image
                    source={{ uri: formData.imageUrl }}
                    className="w-full h-44 object-cover"
                    onError={() => {
                      Alert.alert(
                        "Aviso",
                        "Não foi possível carregar a imagem de preview."
                      );
                    }}
                  />
                </View>
              </View>
            ) : null}
            {/* FIM COMPONENTE: ImagePreview */}

            {/* Botões */}
            {/* INÍCIO COMPONENTE: ButtonsRow */}
            <View className="flex-row w-full mt-2">
              <View className="flex-1 mr-2">
                {/* INÍCIO COMPONENTE: PrimaryButton (Criar Item) */}
                <Button
                  onPress={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    "Criar Item"
                  )}
                </Button>
                {/* FIM COMPONENTE: PrimaryButton (Criar Item) */}
              </View>
              <View className="flex-1">
                {/* INÍCIO COMPONENTE: SecondaryButton (Cancelar) */}
                <Button onPress={() => navigation.navigate("Home")}>
                  Cancelar
                </Button>
                {/* FIM COMPONENTE: SecondaryButton (Cancelar) */}
              </View>
            </View>
            {/* FIM COMPONENTE: ButtonsRow */}
          </View>
          {/* FIM COMPONENTE: FormCard */}
        </ScrollView>
        {/* FIM COMPONENTE: CenteredScrollContent */}
      </KeyboardAvoidingView>
      {/* FIM COMPONENTE: KeyboardAvoidingContainer */}
      {/* FIM COMPONENTE: ScreenContainer */}
    </View>
  );
}

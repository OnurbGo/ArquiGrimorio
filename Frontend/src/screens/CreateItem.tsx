import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import Navigation from "../components/Navigation";
import { createItem } from "../hooks/itens/item";
import type { Item } from "../interface/Item";

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
      <Navigation />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            padding: 20,
            paddingBottom: 48,
          }}
        >
          <View className="w-full max-w-3xl bg-white rounded-2xl p-4 border border-indigo-500/10 shadow-lg">
            <View className="flex-row items-center mb-3">
              <View className="w-14 h-14 rounded-xl bg-violet-900/10 items-center justify-center mr-3">
                <Text className="text-violet-700 font-extrabold text-xl">
                  ✦
                </Text>
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

            <View className="flex-row w-full mb-3">
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
            </View>

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

            <View className="flex-row w-full mb-3">
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
            </View>

            <View className="flex-row w-full mt-2">
              <View className="flex-1 mr-2">
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
              </View>
              <View className="flex-1">
                <Button onPress={() => navigation.navigate("Home")}>
                  Cancelar
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

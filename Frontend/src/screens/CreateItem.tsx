// src/screens/CreateItem.tsx
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "../components/Button";
import Navigation from "../components/Navigation";
import type { Item } from "../interface/Item";
import { createItem } from "../services/api";

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
    // Validação mínima
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
      // Converte preço (string) para número ou undefined
      const priceParsed = formData.price
        ? Number(String(formData.price).replace(",", "."))
        : undefined;

      // Monta payload seguindo a interface Item esperada
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

      // Chama a rota correta do arquivo de requisições (services/api.tsx)
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Navigation />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={styles.container}
          className="px-4 pb-8"
        >
          <View className="bg-card rounded-2xl p-5 border border-border shadow-elevated">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-4">
                <Text className="text-primary-foreground font-extrabold">
                  ✦
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-2xl font-extrabold text-foreground">
                  Criar Novo Item Mágico
                </Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Compartilhe suas criações com a comunidade.
                </Text>
              </View>
            </View>

            {/* Nome */}
            <View className="mb-4">
              <Text className="text-sm text-foreground font-semibold mb-2">
                Nome do Item *
              </Text>
              <TextInput
                placeholder="Ex: Espada Flamejante do Dragão"
                placeholderTextColor="#9c9cae"
                value={formData.name}
                onChangeText={(t) => handleInputChange("name", t)}
                className="px-3 py-2 rounded-md border border-border text-foreground bg-card-foreground/5"
              />
            </View>

            {/* Raridade e Tipo */}
            <View className="flex-row mb-4">
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text className="text-sm text-foreground font-semibold mb-2">
                  Raridade *
                </Text>
                <View
                  style={styles.pickerWrap}
                  className="rounded-md border border-border bg-card-foreground/4"
                >
                  <Picker
                    selectedValue={formData.rarity}
                    onValueChange={(val) =>
                      handleInputChange("rarity", String(val))
                    }
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

              <View style={{ flex: 1 }}>
                <Text className="text-sm text-foreground font-semibold mb-2">
                  Tipo *
                </Text>
                <View
                  style={styles.pickerWrap}
                  className="rounded-md border border-border bg-card-foreground/4"
                >
                  <Picker
                    selectedValue={formData.type}
                    onValueChange={(val) =>
                      handleInputChange("type", String(val))
                    }
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

            {/* Descrição */}
            <View className="mb-4">
              <Text className="text-sm text-foreground font-semibold mb-2">
                Descrição e Efeitos *
              </Text>
              <TextInput
                placeholder="Descreva os efeitos mágicos, lore e características especiais do item..."
                placeholderTextColor="#9c9cae"
                value={formData.description}
                onChangeText={(t) => handleInputChange("description", t)}
                multiline
                className="px-3 py-3 rounded-md border border-border text-foreground bg-card-foreground/5"
                style={{ minHeight: 120, textAlignVertical: "top" }}
              />
            </View>

            {/* Preço e Imagem */}
            <View className="flex-row mb-4">
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text className="text-sm text-foreground font-semibold mb-2">
                  Preço (Opcional)
                </Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#9c9cae"
                  value={formData.price}
                  onChangeText={(t) => handleInputChange("price", t)}
                  className="px-3 py-2 rounded-md border border-border text-foreground bg-card-foreground/5"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text className="text-sm text-foreground font-semibold mb-2">
                  URL da Imagem (Opcional)
                </Text>
                <TextInput
                  placeholder=""
                  placeholderTextColor="#9c9cae"
                  value={formData.imageUrl}
                  onChangeText={(t) => handleInputChange("imageUrl", t)}
                  className="px-3 py-2 rounded-md border border-border text-foreground bg-card-foreground/5"
                />
              </View>
            </View>

            {/* Prévia da imagem */}
            {formData.imageUrl ? (
              <View className="mb-4">
                <Text className="text-sm text-foreground font-semibold mb-2">
                  Prévia da Imagem
                </Text>
                <View
                  style={styles.preview}
                  className="rounded-md overflow-hidden border border-border bg-muted"
                >
                  <Image
                    source={{ uri: formData.imageUrl }}
                    style={styles.previewImage}
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

            {/* Botões */}
            <View className="flex-row mt-2">
              <View style={{ flex: 1, marginRight: 8 }}>
                <Button
                  onPress={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? "Criando..." : "Criar Item"}
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button onPress={() => navigation.navigate("Home")}>
                  Cancelar
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 16, paddingBottom: 24 },
  pickerWrap: { overflow: "hidden", borderRadius: 8 },
  preview: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2b2b3a",
  },
  previewImage: { width: "100%", height: 180 },
});

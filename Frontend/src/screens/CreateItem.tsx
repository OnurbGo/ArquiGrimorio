import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import Button from "../components/Button";
import Navigation from "../components/Navigation";
import type { Item } from "../interface/Item";
import { createItem } from "../hooks/itens/item";

type RootStackParamList = {
  Home: undefined;
};

const WIN = Dimensions.get("window");

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

  return (
    <SafeAreaView style={styles.root}>
      <Navigation />
      <View style={styles.flex}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.iconWrap}>
                  <Text style={styles.iconText}>✦</Text>
                </View>
                <View style={styles.titleWrap}>
                  <Text style={styles.title}>Criar Novo Item Mágico</Text>
                  <Text style={styles.subtitle}>
                    Compartilhe suas criações com a comunidade
                  </Text>
                </View>
              </View>

              {/* Nome */}
              <View style={styles.field}>
                <Text style={styles.label}>Nome do Item *</Text>
                <TextInput
                  placeholder="Ex: Revolver Dourado"
                  placeholderTextColor="#9ca3af"
                  value={formData.name}
                  onChangeText={(t) => handleInputChange("name", t)}
                  style={styles.input}
                />
              </View>

              {/* Raridade e Tipo */}
              <View style={[styles.row, { marginBottom: 12 }]}>
                <View style={[styles.col, { marginRight: 8 }]}>
                  <Text style={styles.label}>Raridade *</Text>
                  <View style={styles.pickerWrap}>
                    <Picker
                      selectedValue={formData.rarity}
                      onValueChange={(val) =>
                        handleInputChange("rarity", String(val))
                      }
                      style={{
                        width: "100%",
                        color: "#0f172a",
                        backgroundColor: "#f8fafc",
                        borderWidth: 0,
                        borderRadius: 10,
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

                <View style={styles.col}>
                  <Text style={styles.label}>Tipo *</Text>
                  <View style={styles.pickerWrap}>
                    <Picker
                      selectedValue={formData.type}
                      onValueChange={(val) =>
                        handleInputChange("type", String(val))
                      }
                      style={{
                        width: "100%",
                        color: "#0f172a",
                        backgroundColor: "#f8fafc",
                        borderWidth: 0,
                        borderRadius: 10,
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

              {/* Descrição */}
              <View style={styles.field}>
                <Text style={styles.label}>Descrição e Efeitos *</Text>
                <TextInput
                  placeholder="Descreva os efeitos mágicos, lore e características especiais do item..."
                  placeholderTextColor="#9ca3af"
                  value={formData.description}
                  onChangeText={(t) => handleInputChange("description", t)}
                  multiline
                  style={[styles.input, styles.textarea]}
                />
              </View>

              {/* Preço e Imagem */}
              <View style={[styles.row, { marginBottom: 12 }]}>
                <View style={[styles.col, { marginRight: 8 }]}>
                  <Text style={styles.label}>Preço (Opcional)</Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                    value={formData.price}
                    onChangeText={(t) => handleInputChange("price", t)}
                    style={styles.input}
                  />
                </View>

                <View style={styles.col}>
                  <Text style={styles.label}>URL da Imagem (Opcional)</Text>
                  <TextInput
                    placeholder="https://.../imagem.png"
                    placeholderTextColor="#9ca3af"
                    value={formData.imageUrl}
                    onChangeText={(t) => handleInputChange("imageUrl", t)}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Prévia da imagem */}
              {formData.imageUrl ? (
                <View style={styles.field}>
                  <Text style={styles.label}>Prévia da Imagem</Text>
                  <View style={styles.preview}>
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
              <View style={[styles.row, { marginTop: 8 }]}>
                <View style={[styles.col, { marginRight: 8 }]}>
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
                <View style={styles.col}>
                  <Button onPress={() => navigation.navigate("Home")}>
                    Cancelar
                  </Button>
                </View>
              </View>
            </View>

            <View style={{ height: 28 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  flex: { flex: 1 },
  scrollContent: { padding: 20, alignItems: "center", paddingBottom: 48 },
  card: {
    width: Math.min(760, WIN.width - 32),
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "rgba(109,40,217,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: { color: "#6d28d9", fontWeight: "800", fontSize: 20 },
  titleWrap: { flex: 1 },
  title: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  subtitle: { marginTop: 4, color: "#6b7280" },

  field: { width: "100%", marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "700", color: "#0f172a", marginBottom: 6 },
  input: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "web" ? 10 : 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eef2ff",
    color: "#0f172a",
  },
  textarea: { minHeight: 120, textAlignVertical: "top" as const },

  row: { flexDirection: "row", width: "100%" },
  col: { flex: 1 },

  pickerWrap: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eef2ff",
    backgroundColor: "#fbfbff",
  },

  preview: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eef2ff",
    backgroundColor: "#f1f5f9",
  },
  previewImage: { width: "100%", height: 180, resizeMode: "cover" },

  chartLikeWrap: { marginTop: 10, alignItems: "center" },

  // buttons: rely on Button component but add spacing helpers
  smallText: { fontSize: 12 },

  extra: { marginTop: 12 },
});

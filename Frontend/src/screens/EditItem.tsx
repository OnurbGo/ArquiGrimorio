// screens/EditItem.tsx
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  Modal as RNModal,
  ScrollView as RNScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  useWindowDimensions,
  View,
} from "react-native";
import ItemCardEdit from "../components/ItemCardEdit";
import Navigation from "../components/Navigation";
import type { Item } from "../interface/Item";
import { deleteItem, getItems, updateItem } from "../services/api";
import { useAuth } from "../utils/AuthContext";

// cap width como na Home para evitar escalonamento exagerado em web muito larga
const WIN = Dimensions.get("window");
const CAP_WIDTH = Math.min(WIN.width, 1200);
const vw = CAP_WIDTH / 100;

/* ---------- picker options (copiado do Search) ---------- */
const RARITIES = [
  { value: "todas", label: "Todas" },
  { value: "comum", label: "Comum" },
  { value: "incomum", label: "Incomum" },
  { value: "raro", label: "Raro" },
  { value: "muito-raro", label: "Muito Raro" },
  { value: "lendario", label: "Lendário" },
  { value: "artefato", label: "Artefato" },
];

const TYPES = [
  { value: "todos", label: "Todos" },
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

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * DarkSelect - dropdown customizado para usar dentro do modal.
 * - options: {value,label}[]
 * - value: string
 * - onChange: (value)=>void
 * - labelStyle / containerStyle opcionais
 *
 * Implementado inline para evitar dependências externas e garantir estilo escuro.
 */
function DarkSelect({
  options,
  value,
  onChange,
  placeholder,
  containerStyle,
  labelStyle,
}: {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  containerStyle?: any;
  labelStyle?: any;
}) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 320 });
  const buttonRef = useRef<View>(null);
  const selected = options.find((o) => o.value === value);

  const toggle = () => {
    if (!open && buttonRef.current) {
      buttonRef.current.measure((fx, fy, width, height, px, py) => {
        setDropdownPos({ top: py + height, left: px, width });
        setOpen(true);
      });
    } else {
      setOpen((s) => !s);
    }
  };

  const handlePick = (v: string) => {
    onChange(v);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(false);
  };

  return (
    <View style={[{ position: "relative" }, containerStyle]}>
      <View ref={buttonRef}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={toggle}
          style={styles.customPickerButton}
        >
          <Text style={[styles.customPickerLabel, labelStyle]}>
            {selected ? selected.label : placeholder ?? "Selecionar"}
          </Text>
          <Text style={styles.customPickerCaret}>{open ? "▴" : "▾"}</Text>
        </TouchableOpacity>
      </View>
      {/* Dropdown como modal/portal */}
      <RNModal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.pickerModalOverlay}
          onPress={() => setOpen(false)}
        />
        <View
          style={[
            styles.pickerModalDropdown,
            {
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              right: undefined,
              alignSelf: undefined,
            },
          ]}
        >
          <RNScrollView
            style={{ maxHeight: 200 }}
            nestedScrollEnabled
            contentContainerStyle={{ paddingVertical: 6 }}
          >
            {options.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => handlePick(opt.value)}
                style={({ pressed }) => [
                  styles.customPickerOption,
                  pressed && { backgroundColor: "#262635" },
                ]}
              >
                <Text style={styles.customPickerOptionText}>{opt.label}</Text>
              </Pressable>
            ))}
          </RNScrollView>
        </View>
      </RNModal>
    </View>
  );
}

const EditItem: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { width } = useWindowDimensions();

  // Modal / edição
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  // formulário local dentro do modal
  const [form, setForm] = useState({
    name: "",
    description: "",
    rarity: "",
    type: "",
    price: "",
    image_url: "",
  });

  // responsivo: 1 / 2 / 3 colunas
  const numColumns = width >= 1024 ? 3 : width >= 768 ? 2 : 1;

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name ?? "",
        description: editingItem.description ?? "",
        rarity: editingItem.rarity ?? "",
        type: editingItem.type ?? "",
        price: editingItem.price != null ? String(editingItem.price) : "",
        image_url: editingItem.image_url ?? "",
      });
    }
  }, [editingItem]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const all = await getItems();
      const my = user ? all.filter((it: Item) => it.user_id === user.id) : [];
      setItems(my);
    } catch (err: any) {
      Alert.alert(
        "Erro",
        err?.message || "Não foi possível carregar os itens."
      );
    } finally {
      setLoading(false);
    }
  };

  // Abre modal de edição (é chamado pelo ItemCardEdit)
  const handleEdit = (item: Item) => {
    setEditingItem(item);
  };

  // Remove item (usado no card e também após confirmação no modal)
  const handleDelete = async (itemId: number) => {
    // confirmação padrão
    Alert.alert(
      "Excluir Item",
      "Tem certeza que deseja excluir este item?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteItem(itemId);
              setItems((prev) => prev.filter((i) => i.id !== itemId));
              if (editingItem?.id === itemId) setEditingItem(null);
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
      ],
      { cancelable: true }
    );
  };

  const handleSave = async () => {
    if (!editingItem) return;
    if (!form.name.trim()) {
      Alert.alert("Validação", "O nome é obrigatório.");
      return;
    }

    const payload: Item = {
      ...editingItem,
      name: form.name,
      description: form.description,
      rarity: form.rarity,
      type: form.type,
      price: form.price ? Number(form.price) : 0,
      image_url: form.image_url,
    };

    try {
      setSaving(true);
      const updated = await updateItem(editingItem.id, payload);
      setItems((prev) =>
        prev.map((it) => (it.id === updated.id ? updated : it))
      );
      setEditingItem(null);
    } catch (err: any) {
      Alert.alert("Erro", err?.message || "Não foi possível salvar o item.");
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <ItemCardEdit item={item} onEdit={handleEdit} onDelete={handleDelete} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Navigation />

      <View style={[styles.container, { paddingHorizontal: 5 * vw }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Meus Itens</Text>
          <Text style={styles.count}>
            {items.length} item{items.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            onRefresh={fetchItems}
            refreshing={loading}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum item encontrado.</Text>
            }
            contentContainerStyle={{ paddingBottom: 40, paddingTop: 12 }}
            numColumns={numColumns}
            columnWrapperStyle={
              numColumns > 1
                ? { justifyContent: "space-between", paddingHorizontal: 2 * vw }
                : undefined
            }
          />
        )}
      </View>

      {/* Modal de edição com blur no fundo */}
      <Modal
        visible={!!editingItem}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingItem(null)}
      >
        {/* Blur por trás */}
        <BlurView intensity={80} tint="dark" style={styles.blurBackground} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalWrapper}
        >
          <View style={styles.modalCard}>
            <RNScrollView contentContainerStyle={{ paddingBottom: 18 }}>
              <Text style={styles.modalTitle}>Editar Item</Text>

              <Text style={styles.label}>Nome</Text>
              <TextInput
                value={form.name}
                onChangeText={(t) => setForm((s) => ({ ...s, name: t }))}
                style={styles.input}
                placeholder="Nome do item"
                placeholderTextColor="#8a87a8"
              />

              <Text style={styles.label}>Descrição</Text>
              <TextInput
                value={form.description}
                onChangeText={(t) => setForm((s) => ({ ...s, description: t }))}
                style={[styles.input, { height: 100 }]}
                placeholder="Descrição do item"
                placeholderTextColor="#8a87a8"
                multiline
              />

              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1, zIndex: 99999 }}>
                  <Text style={styles.label}>Raridade</Text>

                  <DarkSelect
                    options={RARITIES}
                    value={form.rarity || "todas"}
                    onChange={(val) => setForm((s) => ({ ...s, rarity: val }))}
                    placeholder="Selecione raridade"
                    containerStyle={{ zIndex: 99999 }}
                    labelStyle={{ color: "#fff" }}
                  />
                </View>

                <View style={{ flex: 1, zIndex: 99999 }}>
                  <Text style={styles.label}>Tipo</Text>

                  <DarkSelect
                    options={TYPES}
                    value={form.type || "todos"}
                    onChange={(val) => setForm((s) => ({ ...s, type: val }))}
                    placeholder="Selecione tipo"
                    containerStyle={{ zIndex: 99999 }}
                    labelStyle={{ color: "#fff" }}
                  />
                </View>
              </View>

              <Text style={styles.label}>Preço (mo)</Text>
              <TextInput
                value={form.price}
                onChangeText={(t) => setForm((s) => ({ ...s, price: t }))}
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#8a87a8"
                keyboardType="numeric"
              />

              <Text style={styles.label}>URL da imagem</Text>
              <TextInput
                value={form.image_url}
                onChangeText={(t) => setForm((s) => ({ ...s, image_url: t }))}
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor="#8a87a8"
                autoCapitalize="none"
              />

              {/* Botões */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setEditingItem(null)}
                  style={[styles.modalBtn, styles.cancelBtn]}
                  disabled={saving || deleting}
                >
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  style={[styles.modalBtn, styles.saveBtn]}
                  disabled={saving || deleting}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalBtnText}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Exclusão */}
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
                              setItems((prev) =>
                                prev.filter((i) => i.id !== editingItem.id)
                              );
                              setEditingItem(null);
                            } catch (err: any) {
                              Alert.alert(
                                "Erro",
                                err?.message ||
                                  "Não foi possível excluir o item."
                              );
                            } finally {
                              setDeleting(false);
                            }
                          },
                        },
                      ]
                    )
                  }
                  style={styles.deleteBigBtn}
                  disabled={saving || deleting}
                >
                  {deleting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.deleteBigText}>Excluir item</Text>
                  )}
                </TouchableOpacity>
              </View>
            </RNScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#07070a",
  },

  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 12 : 10,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },

  count: {
    color: "#d1cfe8",
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 32,
    color: "#d1cfe8",
  },

  // modal / blur
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },

  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 1001,
  },

  modalCard: {
    width: "100%",
    maxWidth: 900,
    backgroundColor: "#1a1a2b",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#7f32cc",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 20,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },

  label: {
    color: "#d1cfe8",
    marginBottom: 6,
    marginTop: 6,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#0f0f1a",
    borderWidth: 1,
    borderColor: "#2b2b45",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  /* Custom select (dark) */
  customPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0f0f1a",
    borderWidth: 1,
    borderColor: "#2b2b45",
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "web" ? 10 : 8,
    borderRadius: 10,
  },
  customPickerLabel: {
    color: "#fff",
    fontWeight: "600",
  },
  customPickerCaret: {
    color: "#8a87a8",
    marginLeft: 8,
  },
  customPickerDropdown: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: "#0f0f1a",
    borderWidth: 1,
    borderColor: "#2b2b45",
    borderRadius: 10,
    marginTop: 6,
    zIndex: 99999,
    elevation: 999,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    overflow: "hidden",
  },
  customPickerOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  customPickerOptionText: {
    color: "#fff",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },

  modalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 96,
    alignItems: "center",
  },

  cancelBtn: {
    backgroundColor: "#2b2b45",
  },

  saveBtn: {
    backgroundColor: "#7f32cc",
  },

  modalBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  deleteBigBtn: {
    marginTop: 6,
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  deleteBigText: {
    color: "#fff",
    fontWeight: "800",
  },

  pickerModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 99999,
  },
  pickerModalDropdown: {
    position: "absolute",
    top: Platform.OS === "web" ? "35%" : "30%",
    left: Platform.OS === "web" ? "30%" : 20,
    right: Platform.OS === "web" ? "30%" : 20,
    minWidth: Platform.OS === "web" ? 320 : undefined,
    maxWidth: Platform.OS === "web" ? 400 : undefined,
    backgroundColor: "#0f0f1a",
    borderWidth: 1,
    borderColor: "#2b2b45",
    borderRadius: 10,
    zIndex: 99999,
    elevation: 999,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    overflow: "hidden",
    padding: 8,
    alignSelf: Platform.OS === "web" ? "center" : undefined,
  },
});

export default EditItem;

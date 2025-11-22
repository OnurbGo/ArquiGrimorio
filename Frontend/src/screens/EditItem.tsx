// screens/EditItem.tsx
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  Modal as RNModal,
  ScrollView as RNScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  useWindowDimensions,
  View,
  Image,
} from "react-native";
import ItemCardEdit from "../components/ItemCardEdit";
import Navigation from "../components/Navigation";
import type { Item } from "../interface/Item";
import { deleteItem, getItems, updateItem, updateItemPhoto } from "../hooks/itens/item";
import { useAuth } from "../utils/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ItemsGridEdit from "../components/itemedit/ItemsGridEdit";
import DeleteSection from "../components/itemedit/DeleteSection";
import SaveCancel from "@/components/itemedit/SaveCancel";
import RarityType from "@/components/itemedit/RarityType";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/api";

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
 * Implementado inline para evitar dependências externas e garantir estilo escuro.
 */
// INÍCIO COMPONENTE: DarkSelect
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
          className="flex-row items-center justify-between bg-[#0f0f1a] border border-[#2b2b45] px-2.5 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold" style={labelStyle}>
            {selected ? selected.label : placeholder ?? "Selecionar"}
          </Text>
          <Text className="text-[#8a87a8] ml-2">{open ? "▴" : "▾"}</Text>
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
          className="absolute inset-0 bg-black/20 z-[99999]"
          onPress={() => setOpen(false)}
        />
        <View
          className="absolute bg-[#0f0f1a] border border-[#2b2b45] rounded-lg z-[99999] shadow-lg overflow-hidden"
          style={[
            {
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
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
                className="py-2.5 px-3 active:bg-[#262635]"
              >
                <Text className="text-white">{opt.label}</Text>
              </Pressable>
            ))}
          </RNScrollView>
        </View>
      </RNModal>
    </View>
  );
}
// FIM COMPONENTE: DarkSelect

const EditItem: React.FC = () => {
  const { user, token } = useAuth(); // <— adiciona token aqui
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
  const [imageAsset, setImageAsset] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [imageSaving, setImageSaving] = useState(false);

  // responsivo: 1 / 2 / 3 colunas
  const numColumns = width >= 1024 ? 3 : width >= 768 ? 2 : 1;
  const insets = useSafeAreaInsets();

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
      setImageAsset(null); // limpa seleção anterior
    }
  }, [editingItem]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const all = await getItems();
      const my = user ? all.filter((it: Item) => it.user_id === user.id) : [];
      setItems(my);
    } catch (err: any) {
      Alert.alert("Erro", err?.message || "Não foi possível carregar os itens.");
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
              Alert.alert("Erro", err?.message || "Não foi possível excluir o item.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  async function pickNewImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permissão", "Conceda acesso às imagens.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (res.canceled) return;
    const a = res.assets[0];
    console.log(`[frontend] edit item picked new image uri=${a.uri} mime=${a.mimeType}`);
    setImageAsset({
      uri: a.uri,
      name: a.fileName || `item-${editingItem?.id || Date.now()}.jpg`,
      type: a.mimeType || "image/jpeg",
    });
  }

  async function handleSaveImage() {
    if (!editingItem || !imageAsset) return;
    setImageSaving(true);
    try {
      const updated = await updateItemPhoto(
        editingItem.id,
        imageAsset,
        token || undefined // <— usa token do contexto
      );
      setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
      setForm((f) => ({ ...f, image_url: updated.image_url || "" }));
      setImageAsset(null);
      Alert.alert("Imagem", "Imagem atualizada com sucesso.");
    } catch (err: any) {
      Alert.alert("Erro", err?.response?.data?.error || err?.message || "Falha ao atualizar imagem.");
    } finally {
      setImageSaving(false);
    }
  }

  const handleSave = async () => {
    if (!editingItem) return;
    if (!form.name.trim()) {
      Alert.alert("Validação", "O nome é obrigatório.");
      return;
    }

    const payload: Partial<Item> = {
      name: form.name,
      description: form.description,
      rarity: form.rarity,
      type: form.type,
      price: form.price ? Number(form.price) : 0,
    };

    try {
      setSaving(true);
      const updated = await updateItem(editingItem.id, payload as Item);
      setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
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
    <View className="flex-1 bg-[#07070a]" style={{ paddingTop: insets.top }}>
      {/* INÍCIO COMPONENTE: ScreenContainer */}
      <Navigation />

      {/* INÍCIO COMPONENTE: ContentWrapper */}
      <View className="flex-1 pt-2.5" style={{ paddingHorizontal: 5 * vw }}>
        {/* INÍCIO COMPONENTE: HeaderBar */}
        <View className="flex-row items-baseline justify-between mb-2.5">
          <Text className="text-2xl font-extrabold text-white">Meus Itens</Text>
          <Text className="text-[#d1cfe8] font-semibold">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </Text>
        </View>
        {/* FIM COMPONENTE: HeaderBar */}

        {loading ? (
          <>
            {/* INÍCIO COMPONENTE: LoadingIndicator */}
            <ActivityIndicator style={{ marginTop: 30 }} />
            {/* FIM COMPONENTE: LoadingIndicator */}
          </>
        ) : (
          <>
            {/* INÍCIO COMPONENTE: ItemsGrid */}
            <ItemsGridEdit items={items} renderItem={renderItem} fetchItems={fetchItems} loading={loading} numColumns={numColumns} vw={vw} />
            {/* FIM COMPONENTE: ItemsGrid */}
          </>
        )}
      </View>
      {/* FIM COMPONENTE: ContentWrapper */}

      {/* Modal de edição com blur no fundo */}
      {/* INÍCIO COMPONENTE: EditModal */}
      <Modal
        visible={!!editingItem}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingItem(null)}
      >
        {/* Blur por trás */}
        {/* INÍCIO COMPONENTE: BlurOverlay */}
        <BlurView intensity={80} tint="dark" className="absolute inset-0 z-[1000]" />
        {/* FIM COMPONENTE: BlurOverlay */}

        {/* INÍCIO COMPONENTE: KeyboardAvoidingContainer */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-center items-center px-4 z-[1001]"
        >
          {/* INÍCIO COMPONENTE: ModalCard */}
          <View className="w-full max-w-[900px] bg-[#1a1a2b] rounded-xl p-4 border border-[#7f32cc] shadow-lg">
            <RNScrollView contentContainerStyle={{ paddingBottom: 18 }}>
              {/* INÍCIO COMPONENTE: FormTitle */}
              <Text className="text-white text-xl font-extrabold mb-3">Editar Item</Text>
              {/* FIM COMPONENTE: FormTitle */}

              {/* INÍCIO COMPONENTE: LabeledInput (Nome) */}
              <Text className="text-[#d1cfe8] mb-1.5 mt-1.5 font-semibold">Nome</Text>
              <TextInput
                value={form.name}
                onChangeText={(t) => setForm((s) => ({ ...s, name: t }))}
                className="bg-[#0f0f1a] border border-[#2b2b45] text-white px-3 py-2 rounded-lg"
                placeholder="Nome do item"
                placeholderTextColor="#8a87a8"
              />
              {/* FIM COMPONENTE: LabeledInput (Nome) */}

              {/* INÍCIO COMPONENTE: TextArea (Descrição) */}
              <Text className="text-[#d1cfe8] mb-1.5 mt-1.5 font-semibold">Descrição</Text>
              <TextInput
                value={form.description}
                onChangeText={(t) => setForm((s) => ({ ...s, description: t }))}
                className="bg-[#0f0f1a] border border-[#2b2b45] text-white px-3 py-2 rounded-lg h-[100px]"
                placeholder="Descrição do item"
                placeholderTextColor="#8a87a8"
                multiline
              />
              {/* FIM COMPONENTE: TextArea (Descrição) */}

              <RarityType form={form} setForm={setForm} RARITIES={RARITIES} TYPES={TYPES} DarkSelect={DarkSelect} />  
              {/* INÍCIO COMPONENTE: LabeledInput (Preço) */}
              <Text className="text-[#d1cfe8] mb-1.5 mt-1.5 font-semibold">Preço (mo)</Text>
              <TextInput
                value={form.price}
                onChangeText={(t) => setForm((s) => ({ ...s, price: t }))}
                className="bg-[#0f0f1a] border border-[#2b2b45] text-white px-3 py-2 rounded-lg"
                placeholder="0"
                placeholderTextColor="#8a87a8"
                keyboardType="numeric"
              />
              {/* FIM COMPONENTE: LabeledInput (Preço) */}

              {/* NOVO BLOCO: Imagem do Item */}
              <Text className="text-[#d1cfe8] mb-1.5 mt-1.5 font-semibold">Imagem do Item</Text>
              <View className="flex-row items-center mb-2">
                <TouchableOpacity
                  onPress={pickNewImage}
                  className="bg-[#2b2b45] px-3 py-2 rounded-lg mr-2"
                  activeOpacity={0.85}
                >
                  <Text className="text-white font-semibold text-sm">
                    {imageAsset ? "Trocar Seleção" : form.image_url ? "Trocar Imagem" : "Escolher Imagem"}
                  </Text>
                </TouchableOpacity>
                {imageAsset ? (
                  <TouchableOpacity
                    onPress={() => setImageAsset(null)}
                    className="bg-[#3a3a5a] px-3 py-2 rounded-lg"
                    activeOpacity={0.85}
                  >
                    <Text className="text-white font-semibold text-sm">Cancelar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <View className="rounded-lg border border-[#2b2b45] bg-[#0f0f1a] overflow-hidden mb-3 items-center justify-center" style={{ height: 140 }}>
                {imageAsset ? (
                  <Image
                    source={{ uri: imageAsset.uri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                ) : form.image_url ? (
                  <Image
                    source={{ uri: form.image_url.startsWith("http") ? form.image_url : `${api.defaults.baseURL?.replace(/\/$/,'')}/${form.image_url.startsWith('/')?form.image_url.slice(1):form.image_url}` }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="text-[#8a87a8]">Sem imagem</Text>
                )}
              </View>
              {imageAsset ? (
                <TouchableOpacity
                  disabled={imageSaving}
                  onPress={handleSaveImage}
                  className="bg-[#7f32cc] px-4 py-2 rounded-lg mb-4"
                  activeOpacity={0.85}
                >
                  <Text className="text-white font-bold text-center text-sm">
                    {imageSaving ? "Salvando imagem..." : "Salvar Imagem"}
                  </Text>
                </TouchableOpacity>
              ) : null}

              <SaveCancel handleSave={handleSave} saving={saving} deleting={deleting} setEditingItem={setEditingItem} />
              <DeleteSection editingItem={editingItem} setEditingItem={setEditingItem} deleteItem={deleteItem} setItems={setItems} saving={saving} deleting={deleting} setDeleting={setDeleting} />
            </RNScrollView>
          </View>
          {/* FIM COMPONENTE: ModalCard */}
        </KeyboardAvoidingView>
        {/* FIM COMPONENTE: KeyboardAvoidingContainer */}
      </Modal>
      {/* FIM COMPONENTE: EditModal */}
      {/* FIM COMPONENTE: ScreenContainer */}
    </View>
  );
};

export default EditItem;

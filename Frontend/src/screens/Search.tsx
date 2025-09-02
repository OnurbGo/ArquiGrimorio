import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import ScreenContainer from "../components/ScreenContainer";

import Button from "../components/Button";
import ItemCard from "../components/ItemCard";
import Navigation from "../components/Navigation";
import { Item, ItemFilters } from "../interface/Item";
import { getItems } from "../services/api";

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

export default function Search() {
  const [filters, setFilters] = useState<ItemFilters>({
    q: "",
    rarity: "todas",
    type: "todos",
    page: 1,
  });
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        let allItems = await getItems();
        if (!active) return;

        allItems = allItems.filter((item) => {
          const matchesQ =
            !filters.q ||
            item.name.toLowerCase().includes(filters.q.toLowerCase()) ||
            item.description?.toLowerCase().includes(filters.q.toLowerCase());
          const matchesRarity =
            filters.rarity === "todas" || item.rarity === filters.rarity;
          const matchesType =
            filters.type === "todos" || item.type === filters.type;
          return matchesQ && matchesRarity && matchesType;
        });

        setItems(allItems);
      } catch (err: any) {
        if (!active) return;
        setErrorMsg(err?.message ?? "Erro ao buscar itens");
      } finally {
        active && setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [filters]);

  function handleLike(id: number) {
    console.log("Curtir item:", id);
  }

  function clearFilters() {
    setFilters({ q: "", rarity: "todas", type: "todos", page: 1 });
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Navigation />
      <ScreenContainer>
        <View style={styles.header}>
          <Text style={styles.title}>Buscar Itens</Text>
          <Text style={styles.subtitle}>
            Encontre o item perfeito para sua aventura
          </Text>
        </View>

        {/* Search and Filters */}
        <View style={styles.filtersCard}>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Buscar</Text>
            <TextInput
              placeholder="Digite o nome ou descrição..."
              style={styles.input}
              value={filters.q}
              onChangeText={(text) =>
                setFilters((f) => ({ ...f, q: text, page: 1 }))
              }
            />
          </View>

          <View style={styles.pickerWrap}>
            <Text style={styles.label}>Raridade</Text>
            <Picker
              selectedValue={filters.rarity}
              onValueChange={(val) =>
                setFilters((f) => ({ ...f, rarity: String(val), page: 1 }))
              }
            >
              {RARITIES.map((r) => (
                <Picker.Item key={r.value} label={r.label} value={r.value} />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerWrap}>
            <Text style={styles.label}>Tipo</Text>
            <Picker
              selectedValue={filters.type}
              onValueChange={(val) =>
                setFilters((f) => ({ ...f, type: String(val), page: 1 }))
              }
            >
              {TYPES.map((t) => (
                <Picker.Item key={t.value} label={t.label} value={t.value} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Results */}
        {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
            <Text>Carregando itens...</Text>
          </View>
        ) : items.length > 0 ? (
          <FlatList
            data={items}
            keyExtractor={(it) => String(it.id)}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            renderItem={({ item }) => (
              <ItemCard key={item.id} item={item} onLike={handleLike} />
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Nenhum item encontrado</Text>
            <Text style={styles.emptyText}>Tente ajustar os filtros</Text>
            <Button onPress={clearFilters}>Limpar Filtros</Button>
          </View>
        )}
      </ScreenContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { alignItems: "center", marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#666" },
  filtersCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  inputWrap: { marginBottom: 12 },
  label: { fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 6, padding: 8 },
  pickerWrap: { marginBottom: 12 },
  center: { alignItems: "center", padding: 24 },
  empty: { alignItems: "center", padding: 24 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { color: "#666", marginBottom: 12 },
  error: { color: "red", marginBottom: 12 },
});

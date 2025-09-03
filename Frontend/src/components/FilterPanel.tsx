import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import type { ItemFilters } from "../interface/Item";
import Button from "./Button";
import { Card, CardContent } from "./Card";

interface Props {
  onChange: (next: ItemFilters) => void;
  initial?: ItemFilters;
}

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

export default function FilterPanel({ onChange, initial }: Props) {
  const [q, setQ] = useState<string>(initial?.q ?? "");
  const [rarity, setRarity] = useState<string>(initial?.rarity ?? "todas");
  const [type, setType] = useState<string>(initial?.type ?? "todos");

  useEffect(() => {
    // dispara uma vez ao montar para sincronizar o estado inicial
    onChange({ q, rarity, type, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function apply() {
    onChange({ q: q.trim() || undefined, rarity, type, page: 1 });
  }

  function clearAll() {
    setQ("");
    setRarity("todas");
    setType("todos");
    onChange({ q: undefined, rarity: "todas", type: "todos", page: 1 });
  }

  return (
    <Card className="bg-[#23234a] border border-[#7f32cc] rounded-xl shadow-md">
      <CardContent className="p-4">
        {/* Campo de busca */}
        <View className="mb-5">
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 6,
              letterSpacing: 0.5,
            }}
          >
            Busca (nome/descrição)
          </Text>
          <TextInput
            className="w-full"
            style={{
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#7f32cc",
              backgroundColor: "#1a1a2e",
              color: "#fff",
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontSize: 16,
              marginBottom: 2,
            }}
            placeholder="ex.: invisibilidade, espada..."
            placeholderTextColor="#fff6"
            value={q}
            onChangeText={setQ}
            returnKeyType="search"
          />
        </View>

        {/* Select de raridade */}
        <View className="mb-5">
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 6,
              letterSpacing: 0.5,
            }}
          >
            Raridade
          </Text>
          <View
            style={{
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#7f32cc",
              backgroundColor: "#1a1a2e",
              marginBottom: 2,
            }}
          >
            <Picker
              selectedValue={rarity}
              onValueChange={(v) => setRarity(String(v))}
              style={{
                color: "#000",
                fontSize: 16,
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}
              dropdownIconColor="#7f32cc"
            >
              {RARITIES.map((r) => (
                <Picker.Item
                  key={r.value}
                  label={r.label}
                  value={r.value}
                  color="#000"
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Select de tipo */}
        <View className="mb-5">
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 6,
              letterSpacing: 0.5,
            }}
          >
            Tipo
          </Text>
          <View
            style={{
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#7f32cc",
              backgroundColor: "#1a1a2e",
              marginBottom: 2,
            }}
          >
            <Picker
              selectedValue={type}
              onValueChange={(v) => setType(String(v))}
              style={{
                color: "#000",
                fontSize: 16,
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}
              dropdownIconColor="#7f32cc"
            >
              {TYPES.map((t) => (
                <Picker.Item
                  key={t.value}
                  label={t.label}
                  value={t.value}
                  color="#000"
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Botões */}
        <View className="flex-row gap-2 mt-2">
          <Button
            onPress={apply}
            style={{
              backgroundColor: "#7f32cc",
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
            textStyle={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
          >
            Aplicar
          </Button>
          <Button
            onPress={clearAll}
            style={{
              backgroundColor: "#23234a",
              borderWidth: 2,
              borderColor: "#7f32cc",
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
            textStyle={{ color: "#7f32cc", fontWeight: "bold", fontSize: 16 }}
          >
            Limpar
          </Button>
        </View>
      </CardContent>
    </Card>
  );
}

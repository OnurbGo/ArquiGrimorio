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

const RARITIES = ["todas", "comum", "incomum", "raro", "épico", "lendário"];
const TYPES = ["todos", "arma", "armadura", "anel", "poção", "acessório"];

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
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardContent className="p-4 space-y-4">
        {/* Campo de busca */}
        <View className="space-y-1">
          <Text className="text-sm text-gray-600">Busca (nome/descrição)</Text>
          <TextInput
            className="w-full rounded border px-3 py-2 bg-gray-50 focus:outline-none"
            placeholder="ex.: invisibilidade, espada..."
            value={q}
            onChangeText={setQ}
            returnKeyType="search"
          />
        </View>

        {/* Select de raridade */}
        <View className="space-y-1">
          <Text className="text-sm text-gray-600">Raridade</Text>
          <View className="w-full rounded border bg-gray-50">
            <Picker
              selectedValue={rarity}
              onValueChange={(v) => setRarity(String(v))}
            >
              {RARITIES.map((r) => (
                <Picker.Item key={r} label={r} value={r} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Select de tipo */}
        <View className="space-y-1">
          <Text className="text-sm text-gray-600">Tipo</Text>
          <View className="w-full rounded border bg-gray-50">
            <Picker
              selectedValue={type}
              onValueChange={(v) => setType(String(v))}
            >
              {TYPES.map((t) => (
                <Picker.Item key={t} label={t} value={t} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Botões */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button onPress={apply}>Aplicar</Button>
          <Button
            onPress={clearAll}
            style={{
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#2563eb",
            }}
            textStyle={{ color: "#2563eb" }}
          >
            Limpar
          </Button>
        </View>
      </CardContent>
    </Card>
  );
}

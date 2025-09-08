import { View, Text } from "react-native";
export default function RarityType({
  form,
  setForm,
  RARITIES,
  TYPES,
  DarkSelect,
}: any) {
  return (
    <View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1, zIndex: 99999 }}>
          {/* INÍCIO COMPONENTE: SelectField (Raridade) */}
          <Text className="text-[#d1cfe8] mb-1.5 mt-1.5 font-semibold">
            Raridade
          </Text>
          <DarkSelect
            options={RARITIES}
            value={form.rarity || "todas"}
            onChange={(val: any) =>
              setForm((s: any) => ({ ...s, rarity: val }))
            }
            placeholder="Selecione raridade"
            containerStyle={{ zIndex: 99999 }}
            labelStyle={{ color: "#fff" }}
          />
          {/* FIM COMPONENTE: SelectField (Raridade) */}
        </View>

        <View style={{ flex: 1, zIndex: 99999 }}>
          {/* INÍCIO COMPONENTE: SelectField (Tipo) */}
          <Text className="text-[#d1cfe8] mb-1.5 mt-1.5 font-semibold">
            Tipo
          </Text>
          <DarkSelect
            options={TYPES}
            value={form.type || "todos"}
            onChange={(val: any) => setForm((s: any) => ({ ...s, type: val }))}
            placeholder="Selecione tipo"
            containerStyle={{ zIndex: 99999 }}
            labelStyle={{ color: "#fff" }}
          />
          {/* FIM COMPONENTE: SelectField (Tipo) */}
        </View>
      </View>
    </View>
  );
}

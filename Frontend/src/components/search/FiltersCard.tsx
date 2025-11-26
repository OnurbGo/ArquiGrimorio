import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { TextInput } from "react-native-gesture-handler";
import {Search as SearchIcon} from "lucide-react-native";
import Button from "../Button";

export default function FilterCard( {filters, setFilters, clearFilters, RARITIES, TYPES}: any ) {
    return (
        <View>
             <View className="bg-slate-100 rounded-xl p-3 md:p-4 mb-4 border border-slate-900/10 shadow-md md:flex-row md:items-end md:gap-3">
            <View className="mb-2 md:flex-1">
              <Text className="font-bold mb-1.5 text-slate-900">Buscar</Text>
              <View className="flex-row items-center gap-2 bg-slate-200/60 rounded-lg py-2 px-2.5 border border-slate-900/10">
                <SearchIcon width={18} height={18} color={"#64748b"} />
                <TextInput
                  placeholder="Digite o nome ou descrição..."
                  placeholderTextColor={"#64748b"}
                  className="flex-1 py-0 text-base text-slate-900"
                  value={filters.q}
                  onChangeText={(text) =>
                    setFilters((f:any) => ({ ...f, q: text, page: 1 }))
                  }
                  returnKeyType="search"
                />
              </View>
            </View>
            <View className="mb-2 md:w-[220px] bg-slate-50 rounded-lg border border-slate-900/10 p-2">
              <Text className="font-bold mb-1.5 text-slate-900">Raridade</Text>
              <View className="rounded-lg overflow-hidden border border-slate-900/20 bg-slate-200/60 justify-center shadow-sm min-h-[42px]">
                <Picker
                  selectedValue={filters.rarity}
                  onValueChange={(val) =>
                    setFilters((f:any) => ({ ...f, rarity: val, page: 1 }))
                  }
                  style={{
                    width: "100%",
                    color: "#222",
                    backgroundColor: "transparent",
                    borderWidth: 0,
                  }}
                  dropdownIconColor="#64748b"
                >
                  {RARITIES.map((opt: any) => (
                    <Picker.Item
                      key={opt.value}
                      label={opt.label}
                      value={opt.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View className="mb-2 md:w-[220px] bg-slate-50 rounded-lg border border-slate-900/10 p-2">
              <Text className="font-bold mb-1.5 text-slate-900">Tipo</Text>
              <View className="rounded-lg overflow-hidden border border-slate-900/20 bg-slate-200/60 justify-center shadow-sm min-h-[42px]">
                <Picker
                  selectedValue={filters.type}
                  onValueChange={(val) =>
                    setFilters((f:any) => ({ ...f, type: val, page: 1 }))
                  }
                  style={{
                    width: "100%",
                    color: "#222",
                    backgroundColor: "transparent",
                    borderWidth: 0,
                  }}
                  dropdownIconColor="#64748b"
                >
                  {TYPES.map((opt: any) => (
                    <Picker.Item
                      key={opt.value}
                      label={opt.label}
                      value={opt.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View className="mt-2 md:mt-0 ml-auto self-center">
              <Button onPress={clearFilters}>Limpar Filtros</Button>
            </View>
          </View>
        </View>
    );
}
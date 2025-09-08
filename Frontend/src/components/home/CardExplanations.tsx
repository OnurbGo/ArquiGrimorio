import { Text, View } from "react-native";
import { Library, Search } from "lucide-react-native";

export default function CardExplanations() {
  return (
    <View className="flex-row justify-between px-4">
      <View className="flex-1 bg-cardBg rounded-2xl py-5 px-4 mx-1 items-center shadow-lg shadow-white/20">
        <Search color="#fff" width={22} height={22} />
        <Text className="mt-3 text-base font-bold text-white">
          Busca Inteligente
        </Text>
        <Text className="mt-2 text-sm text-white/75 text-center leading-relaxed">
          Encontre itens por nome, raridade ou efeitos — filtros avançados
          facilitam a descoberta.
        </Text>
      </View>

      <View className="flex-1 bg-cardBg rounded-2xl py-5 px-4 mx-1 items-center shadow-lg shadow-white/20">
        <Library color="#fff" width={22} height={22} />
        <Text className="mt-3 text-base font-bold text-white">
          Criação Colaborativa
        </Text>
        <Text className="mt-2 text-sm text-white/75 text-center leading-relaxed">
          Cadastre itens, compartilhe com a comunidade e aprimore criações
          coletivas.
        </Text>
      </View>
    </View>
  );
}
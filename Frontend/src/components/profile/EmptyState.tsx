import { Text, View } from "react-native";

export default function EmptyState({ user }: any) {
  return (
    <View>
      <View className="items-center p-8">
            <Text className="text-4xl mb-3">📚</Text>
            <Text className="text-lg font-bold">
              Nenhum item criado ainda
            </Text>
            <Text className="text-slate-500 text-center">
              {user.name || "Este usuário"} ainda não criou nenhum item mágico
            </Text>
          </View>
    </View>
  );
}

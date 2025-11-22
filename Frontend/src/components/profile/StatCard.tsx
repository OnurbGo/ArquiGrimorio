import { View, Text } from "react-native";

export default function UserProfile({ userItems, userLikesTotal } : { userItems: any[]; userLikesTotal: number }) {
  return (
    <View className="flex-row justify-between my-3.5">
      <View className="flex-1 mx-1.5 p-3.5 rounded-xl bg-white items-center border border-slate-100">
        <Text className="text-lg">📚</Text>
        <Text className="text-xl font-extrabold text-slate-900 mt-1.5">
          {userItems.length}
        </Text>
        <Text className="text-slate-500 mt-1">Itens Criados</Text>
      </View>
      <View className="flex-1 mx-1.5 p-3.5 rounded-xl bg-white items-center border border-slate-100">
        <Text className="text-lg">❤️</Text>
        <Text className="text-xl font-extrabold text-slate-900 mt-1.5">
          {userLikesTotal}
        </Text>
        <Text className="text-slate-500 mt-1">Likes Totais</Text>
      </View>
    </View>
  );
}

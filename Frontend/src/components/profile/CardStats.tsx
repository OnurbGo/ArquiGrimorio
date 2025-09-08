import { BookOpen, UserIcon } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { getUserCount } from "@/hooks/user/user";
import { getItems } from "@/hooks/itens/item";

export default function CardStats() {
    const [loading, setLoading] = useState(true);
    const [userCount, setUserCount] = useState<number | null>(null);
    const [itemCount, setItemCount] = useState<number | null>(null);

    useEffect(() => {
        async function fetchStats() {
          setLoading(true);
          try {
            const items = await getItems();
            const users = await getUserCount();
            setItemCount(items.length);
            setUserCount(users);
          } catch {
            setItemCount(null);
            setUserCount(null);
          } finally {
            setLoading(false);
          }
        }
        fetchStats();
      }, []);
    

  return (
    <View className="flex-row justify-between gap-3">
      <View className="flex-1 bg-cardBg rounded-xl p-4 items-center shadow-lg shadow-white/20 mx-1">
        <BookOpen color="#fff" width={28} height={28} />
        {loading ? (
          <ActivityIndicator className="mt-3.5" />
        ) : (
          <>
            <Text className="mt-4 text-4xl font-black text-purple">
              {itemCount ?? "-"}
            </Text>
            <Text className="mt-2 text-statLabel text-base font-semibold">
              Itens Cadastrados
            </Text>
          </>
        )}
      </View>

      <View className="flex-1 bg-cardBg rounded-xl p-4 items-center shadow-lg shadow-white/20 mx-1">
        <UserIcon color="#fff" width={28} height={28} />
        {loading ? (
          <ActivityIndicator className="mt-3.5" />
        ) : (
          <>
            <Text className="mt-4 text-4xl font-black text-deepBlue">
              {userCount ?? "-"}
            </Text>
            <Text className="mt-2 text-statLabel text-base font-semibold">
              Criadores Ativos
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
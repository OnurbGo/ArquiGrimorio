import { getItems } from "@/hooks/itens/item";
import { getUserCount } from "@/hooks/user/user";
import { BookOpen, UserIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

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
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#232136",
          borderRadius: 18,
          paddingVertical: "6%",
          paddingHorizontal: "4%",
          alignItems: "center",
          marginHorizontal: "1%",
          shadowColor: "#fff",
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          maxWidth: "48%",
        }}
      >
        <BookOpen color="#fff" width={28} height={28} />
        {loading ? (
          <ActivityIndicator style={{ marginTop: "8%" }} />
        ) : (
          <>
            <Text
              style={{
                marginTop: "10%",
                fontSize: 32,
                fontWeight: "900",
                color: "#a78bfa",
              }}
            >
              {itemCount ?? "-"}
            </Text>
            <Text
              style={{
                marginTop: "6%",
                color: "#b3b3c6",
                fontSize: 16,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Itens Cadastrados
            </Text>
          </>
        )}
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: "#232136",
          borderRadius: 18,
          paddingVertical: "6%",
          paddingHorizontal: "4%",
          alignItems: "center",
          marginHorizontal: "1%",
          shadowColor: "#fff",
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          maxWidth: "48%",
        }}
      >
        <UserIcon color="#fff" width={28} height={28} />
        {loading ? (
          <ActivityIndicator style={{ marginTop: "8%" }} />
        ) : (
          <>
            <Text
              style={{
                marginTop: "10%",
                fontSize: 32,
                fontWeight: "900",
                color: "#a78bfa",
              }}
            >
              {userCount ?? "-"}
            </Text>
            <Text
              style={{
                marginTop: "6%",
                color: "#b3b3c6",
                fontSize: 16,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Criadores Ativos
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

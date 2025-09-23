import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Library, Search } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import type { RootStackParamList } from "../../navigation/Routes";

const CardExplanations = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: "4%",
      }}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "#232136",
          borderRadius: 20,
          paddingVertical: "7%",
          paddingHorizontal: "4%",
          marginHorizontal: "1%",
          alignItems: "center",
          shadowColor: "#fff",
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          maxWidth: "48%",
        }}
        android_ripple={{ color: "#a78bfa22" }}
        onPress={() => navigation.navigate("Search")}
      >
        <Search color="#fff" width={22} height={22} />
        <Text
          style={{
            marginTop: "7%",
            fontSize: 16,
            fontWeight: "bold",
            color: "#fff",
            textAlign: "center",
          }}
        >
          Busca Inteligente
        </Text>
        <Text
          style={{
            marginTop: "5%",
            fontSize: 13,
            color: "#e5e5e5",
            textAlign: "justify",
            lineHeight: 18,
          }}
        >
          Encontre itens por nome, raridade ou efeitos filtros avançados
          facilitam a descoberta.
        </Text>
      </Pressable>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "#232136",
          borderRadius: 20,
          paddingVertical: "7%",
          paddingHorizontal: "4%",
          marginHorizontal: "1%",
          alignItems: "center",
          shadowColor: "#fff",
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          maxWidth: "48%",
        }}
        android_ripple={{ color: "#a78bfa22" }}
        onPress={() => navigation.navigate("CreateItem")}
      >
        <Library color="#fff" width={22} height={22} />
        <Text
          style={{
            marginTop: "7%",
            fontSize: 16,
            fontWeight: "bold",
            color: "#fff",
            textAlign: "center",
          }}
        >
          Criação Colaborativa
        </Text>
        <Text
          style={{
            marginTop: "5%",
            fontSize: 13,
            color: "#e5e5e5",
            textAlign: "justify",
            lineHeight: 18,
          }}
        >
          Cadastre seus itens, compartilhe com a comunidade e aprimore criações
          coletivas.
        </Text>
      </Pressable>
    </View>
  );
};

export default CardExplanations;

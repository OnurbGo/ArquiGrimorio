import React from "react";
import { Button, Text, View } from "react-native";
import Navigation from "../components/Navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NotFound: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <Navigation />
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-7xl font-bold text-red-700">404</Text>
        <Text className="text-xl text-gray-800 mb-6">
          Página não encontrada
        </Text>
        {navigation && (
          <Button
            title="Voltar para Home"
            onPress={() => navigation.navigate("Home")}
          />
        )}
      </View>
    </View>
  );
};

export default NotFound;

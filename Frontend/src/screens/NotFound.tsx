import React from "react";
import { Button, Text, View } from "react-native";
import Navigation from "../components/Navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../style/notFound";

const NotFound: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Navigation />
      <View style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.message}>Página não encontrada</Text>
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

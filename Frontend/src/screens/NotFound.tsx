import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const NotFound: React.FC<{ navigation?: any }> = ({ navigation }) => {
  return (
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  message: {
    fontSize: 20,
    color: "#333",
    marginBottom: 24,
  },
});

export default NotFound;

import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";

type RootStackParamList = {
  Login: undefined;
  // ...outras rotas se necessário
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isReady } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    // só agir depois de saber que o provedor terminou a inicialização
    if (!isReady) return;
    if (!isAuthenticated) {
      // navega para Login quando não autenticado
      navigation.navigate("Login");
    }
  }, [isAuthenticated, isReady, navigation]);

  if (!isReady) return null; // ou um loading component simples

  // enquanto não autenticado, renderizamos nada (o effect fará a navegação)
  if (!isAuthenticated) return null;

  return <>{children}</>;
};

export default PrivateRoute;

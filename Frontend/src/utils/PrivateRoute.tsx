import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";

type RootStackParamList = {
  Login: undefined;
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isReady } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      navigation.navigate("Login");
    }
  }, [isAuthenticated, isReady, navigation]);

  if (!isReady) return null;
  if (!isAuthenticated) return null;

  return <>{children}</>;
};

export default PrivateRoute;

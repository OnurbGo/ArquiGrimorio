import { NavigationProp, useNavigation } from "@react-navigation/native";
import React from "react";
import { useAuth } from "./AuthContext";

type RootStackParamList = {
  Login: undefined;
  // add other routes here if needed
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  if (!isAuthenticated) {
    navigation.navigate("Login");
    return null;
  }

  return <>{children}</>;
};

export default PrivateRoute;

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import CreateAccount from "../screens/CreateAccount";
import CreateItem from "../screens/CreateItem";
import Home from "../screens/Home";
import ItemDetailsPage from "../screens/ItemDetails";
import LoginAccount from "../screens/LoginAccount";
import NotFound from "../screens/NotFound";
import Search from "../screens/Search";
import UserProfile from "../screens/UserProfile";

/**
 * Root stack params: definir aqui centraliza as tipagens para uso em todas as telas.
 */
export type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  CreateItem: undefined;
  Login: undefined;
  CreateAccount: undefined;
  UserProfile: { userId?: string | number };
  ItemDetails: { id: number };
  NotFound: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Routes() {
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "app://";

  const linking = {
    prefixes: [origin, "exp://127.0.0.1:19000", "exp://localhost:19000"],
    config: {
      screens: {
        Home: "",
        Search: "search",
        CreateItem: "create",
        Login: "login",
        CreateAccount: "createaccount",
        UserProfile: "profile",
        ItemDetails: "item/:id",
        NotFound: "*",
      },
    },
  };

  return (
    <NavigationContainer linking={linking} fallback={<></>}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Login"
          component={LoginAccount}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateAccount"
          component={CreateAccount}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ItemDetails"
          component={ItemDetailsPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserProfile"
          component={UserProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateItem"
          component={CreateItem}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Search"
          component={Search}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NotFound"
          component={NotFound}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

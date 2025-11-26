import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import CreateAccount from "../screens/CreateAccount";
import CreateItem from "../screens/CreateItem";
import EditItem from "../screens/EditItem";
import Home from "../screens/Home";
import ItemDetails from "../screens/ItemDetails";
import LoginAccount from "../screens/LoginAccount";
import NotFound from "../screens/NotFound";
import Search from "../screens/Search";
import UserProfile from "../screens/UserProfile";
import PrivateRoute from "../utils/PrivateRoute";


export type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  CreateItem: undefined;
  Login: undefined;
  CreateAccount: undefined;
  UserProfile: { userId?: string | number };
  ItemDetails: { id: number };
  NotFound: undefined;
  EditItem: undefined;
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
        EditItem: "edititem",
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
        <Stack.Screen name="ItemDetails" options={{ headerShown: false }}>
          {() => (
            <PrivateRoute>
              <ItemDetails />
            </PrivateRoute>
          )}
        </Stack.Screen>
        <Stack.Screen name="UserProfile" options={{ headerShown: false }}>
          {() => (
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          )}
        </Stack.Screen>
        <Stack.Screen name="CreateItem" options={{ headerShown: false }}>
          {() => (
            <PrivateRoute>
              <CreateItem />
            </PrivateRoute>
          )}
        </Stack.Screen>
        <Stack.Screen name="EditItem" options={{ headerShown: false }}>
          {() => (
            <PrivateRoute>
              <EditItem />
            </PrivateRoute>
          )}
        </Stack.Screen>
        <Stack.Screen name="Search" options={{ headerShown: false }}>
          {() => (
            <PrivateRoute>
              <Search />
            </PrivateRoute>
          )}
        </Stack.Screen>
        <Stack.Screen name="NotFound" options={{ headerShown: true }}>
          {() => <NotFound />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

  import { NavigationContainer } from "@react-navigation/native";
  import { createStackNavigator } from "@react-navigation/stack";

  import ItemDetailsPage from "../components/ItemDetails";
  import CreateItem from "../screens/CreateItem";
  import Home from "../screens/Home";
  import LoginAccount from "../screens/LoginAccount";
  import NotFound from "../screens/NotFound";
  import Search from "../screens/Search";
  import UserProfile from "../screens/UserProfile";
  import { AuthProvider } from "../utils/AuthContext";

  /**
   * Root stack params: definir aqui centraliza as tipagens para uso em todas as telas.
   */
  export type RootStackParamList = {
    Home: undefined;
    Search: undefined;
    CreateItem: undefined;
    Login: undefined;
    UserProfile: { userId: string | number } | undefined;
    ItemDetails: { id: number };
    NotFound: undefined;
  };

  const Stack = createStackNavigator<RootStackParamList>();

  export default function Routes() {
    const linking = {
      prefixes: [
        typeof window !== "undefined" ? window.location.origin : "app://",
      ],
      config: {
        screens: {
          Home: "",
          Search: "search",
          CreateItem: "create",
          Login: "login",
          UserProfile: "profile",
          ItemDetails: "item/:id",
          NotFound: "*",
        },
      },
    };

    return (
      <AuthProvider>
        <NavigationContainer linking={linking}>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Login" component={LoginAccount} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="ItemDetails" component={ItemDetailsPage} />
            <Stack.Screen name="UserProfile" component={UserProfile} />
            <Stack.Screen name="CreateItem" component={CreateItem} />
            <Stack.Screen name="Search" component={Search} />
            <Stack.Screen name="NotFound" component={NotFound} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    );
  }

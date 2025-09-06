import { SafeAreaProvider } from "react-native-safe-area-context";
import Routes from "./src/navigation/Routes";
import { AuthProvider } from "./src/utils/AuthContext";
import "./src/css/Global.css";

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;

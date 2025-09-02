import Routes from "./src/navigation/Routes";
import { AuthProvider } from "./src/utils/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;

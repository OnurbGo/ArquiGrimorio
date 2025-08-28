import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";

const AUTH_KEY = "authToken";

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false); // para sinalizar load inicial

  useEffect(() => {
    (async () => {
      try {
        let stored: string | null = null;
        if (Platform.OS === "web" && typeof window !== "undefined") {
          stored = window.localStorage.getItem(AUTH_KEY);
        } else {
          stored = await AsyncStorage.getItem(AUTH_KEY);
        }
        if (stored) {
          setToken(stored);
        } else {
          setToken(null);
        }
      } catch (err) {
        console.warn("AuthProvider init error:", err);
        setToken(null);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const login = async (t: string) => {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.localStorage.setItem(AUTH_KEY, t);
      } else {
        await AsyncStorage.setItem(AUTH_KEY, t);
      }
      setToken(t);
    } catch (err) {
      console.warn("login error:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.localStorage.removeItem(AUTH_KEY);
      } else {
        await AsyncStorage.removeItem(AUTH_KEY);
      }
      setToken(null);
    } catch (err) {
      console.warn("logout error:", err);
    }
  };

  // enquanto carregando, ainda podemos mostrar children (ou você pode usar skeletons)
  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!token, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

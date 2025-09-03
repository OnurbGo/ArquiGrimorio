import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { decode as atob } from "base-64";
import type { User } from "../interface/User";
import api from "../services/api";

const AUTH_KEY = "arquiGrimorio:auth:v1";
const AUTH_USERID_KEY = "arquiGrimorio:userId:v1";
const AUTH_USERNAME_KEY = "arquiGrimorio:userName:v1";
const DEBUG_FORCE_ASYNCSTORE = false;
const isWeb = Platform.OS === "web";

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  userId: number | null;
  userName: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isReady: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- storage helpers (web / SecureStore / AsyncStorage) ---
let _secureAvailableCache: boolean | null = null;
async function secureAvailable(): Promise<boolean> {
  if (DEBUG_FORCE_ASYNCSTORE) return false;
  if (_secureAvailableCache !== null) return _secureAvailableCache;
  if (isWeb) {
    _secureAvailableCache = false;
    return _secureAvailableCache;
  }
  try {
    const SecureStore = await import("expo-secure-store");
    const ok =
      typeof SecureStore?.isAvailableAsync === "function"
        ? await SecureStore.isAvailableAsync()
        : false;
    _secureAvailableCache = !!ok;
    return _secureAvailableCache;
  } catch (err) {
    console.warn("secureAvailable import failed:", err);
    _secureAvailableCache = false;
    return false;
  }
}

async function storageGet(key: string) {
  if (isWeb && typeof window !== "undefined") {
    return window.localStorage.getItem(key);
  }
  if (await secureAvailable()) {
    try {
      const SecureStore = await import("expo-secure-store");
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.warn(
        "SecureStore.getItemAsync failed, fallback to AsyncStorage:",
        err
      );
    }
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch (err) {
    console.warn("AsyncStorage.getItem failed:", err);
    return null;
  }
}

async function storageSet(key: string, value: string) {
  if (isWeb && typeof window !== "undefined") {
    window.localStorage.setItem(key, value);
    return;
  }
  if (await secureAvailable()) {
    try {
      const SecureStore = await import("expo-secure-store");
      await SecureStore.setItemAsync(key, value);
      return;
    } catch (err) {
      console.warn(
        "SecureStore.setItemAsync failed, fallback to AsyncStorage:",
        err
      );
    }
  }
  await AsyncStorage.setItem(key, value);
}

async function storageRemove(key: string) {
  if (isWeb && typeof window !== "undefined") {
    window.localStorage.removeItem(key);
    return;
  }
  if (await secureAvailable()) {
    try {
      const SecureStore = await import("expo-secure-store");
      await SecureStore.deleteItemAsync(key);
      return;
    } catch (err) {
      console.warn(
        "SecureStore.deleteItemAsync failed, fallback to AsyncStorage:",
        err
      );
    }
  }
  await AsyncStorage.removeItem(key);
}

// --- Provider ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Safely decode JWT payload and return minimal info (id, email)
  const decodeToken = (t: string): { id?: number; email?: string } | null => {
    try {
      const payloadPart = t.split(".")[1];
      if (!payloadPart) return null;
      const json = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(json);
      return payload || null;
    } catch (err) {
      console.warn("AuthProvider: failed to decode JWT:", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await storageGet(AUTH_KEY);
        if (!mounted) return;
        if (stored) {
          setToken(stored);
          api.defaults.headers.common["Authorization"] = `Bearer ${stored}`;

          // Try to use cached id/name quickly
          const cachedIdStr = await storageGet(AUTH_USERID_KEY);
          const cachedName = await storageGet(AUTH_USERNAME_KEY);
          const decoded = decodeToken(stored);
          const idFromToken = decoded?.id ?? null;
          const idToUse = cachedIdStr ? Number(cachedIdStr) : idFromToken;
          setUserId(Number.isFinite(idToUse as number) ? (idToUse as number) : null);
          setUserName(cachedName ?? null);

          // Refresh user data from API when possible
          if (idToUse) {
            try {
              const res = await api.get(`/users/${idToUse}`);
              if (!mounted) return;
              const u: User | null = res.data ?? null;
              setUser(u);
              if (u?.id) await storageSet(AUTH_USERID_KEY, String(u.id));
              if (u?.name) {
                setUserName(u.name);
                await storageSet(AUTH_USERNAME_KEY, u.name);
              }
            } catch (err) {
              console.warn("AuthProvider: fetch /users/:id failed:", err);
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } else {
          setToken(null);
          setUser(null);
          setUserId(null);
          setUserName(null);
          delete api.defaults.headers.common["Authorization"];
        }
      } catch (err) {
        console.warn("AuthProvider init error:", err);
        setToken(null);
        setUser(null);
        setUserId(null);
        setUserName(null);
        delete api.defaults.headers.common["Authorization"];
      } finally {
        if (mounted) setIsReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (t: string) => {
    await storageSet(AUTH_KEY, t);
    setToken(t);
    api.defaults.headers.common["Authorization"] = `Bearer ${t}`;

    const decoded = decodeToken(t);
    const id = decoded?.id ?? null;
    if (id) {
      setUserId(id);
      await storageSet(AUTH_USERID_KEY, String(id));
      try {
        const res = await api.get(`/users/${id}`);
        const u: User | null = res.data ?? null;
        setUser(u);
        if (u?.name) {
          setUserName(u.name);
          await storageSet(AUTH_USERNAME_KEY, u.name);
        } else {
          setUserName(null);
        }
      } catch (err) {
        console.warn("AuthProvider.login: fetch /users/:id failed:", err);
        setUser(null);
        setUserName(null);
      }
    } else {
      setUserId(null);
      setUserName(null);
      setUser(null);
    }
  };

  const logout = async () => {
    await storageRemove(AUTH_KEY);
  await storageRemove(AUTH_USERID_KEY);
  await storageRemove(AUTH_USERNAME_KEY);
    setToken(null);
    setUser(null);
  setUserId(null);
  setUserName(null);
    delete api.defaults.headers.common["Authorization"];
  };

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        user,
  userId,
  userName,
        login,
        logout,
        isReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
};

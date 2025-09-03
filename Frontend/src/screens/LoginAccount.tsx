// LoginAccount.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Button from "@/components/Button";
import Navigation from "../components/Navigation";
import api from "../services/api";
import { useAuth } from "../utils/AuthContext";

/* ---------- responsive helpers ---------- */
const WIN = Dimensions.get("window");
const CAP_WIDTH = Math.min(WIN.width, 1200); // cap vw so it doesn't explode on large web screens
const vw = CAP_WIDTH / 100;
const vh = WIN.height / 100;
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

/* ---------- theme ---------- */
const THEME = {
  bg: "#0b1220",
  card: "#071525",
  muted: "#9ca3af",
  text: "#e6eef8",
  accent: "#7c5cff",
  danger: "#fb7185",
};

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  CreateAccount: undefined;
};

export default function LoginAccount() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError("Preencha email e senha.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const resp = await api.post("/login", {
        email: email.trim(),
        password,
      });

      const token = resp?.data?.token ?? resp?.data?.accessToken ?? null;
      if (!token) throw new Error("Token não retornado pela API.");

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await login(token);

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (err: any) {
      console.error("Login error:", err);
      if (isAxiosError(err)) {
        const msg =
          err.response?.data?.message ?? err.response?.data ?? err.message;
        setError(typeof msg === "string" ? msg : "Erro ao autenticar");
      } else {
        setError(err?.message ?? "Erro ao autenticar");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={stylesSafe.safeArea}>
      <Navigation />
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={stylesSafe.keyboard}
        >
          <View style={styles.wrapper}>
            <View style={styles.header}>
              <Text style={styles.title}>ArquiGrimório</Text>
              <Text style={styles.subtitle}>Portal de Itens Místicos</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="seu@exemplo.com"
                placeholderTextColor={THEME.muted}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                style={styles.input}
                accessible
                accessibilityLabel="Email"
              />

              <Text style={[styles.label, { marginTop: 12 }]}>Senha</Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secure}
                  placeholder="••••••••"
                  placeholderTextColor={THEME.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="send"
                  onSubmitEditing={handleSubmit}
                  style={[styles.input, { paddingRight: 44 }]}
                  accessible
                  accessibilityLabel="Senha"
                />
                <TouchableOpacity
                  onPress={() => setSecure((s) => !s)}
                  accessibilityLabel="alternar visibilidade senha"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.eyeBtn}
                >
                  {secure ? (
                    <Eye size={20} color={THEME.muted} />
                  ) : (
                    <EyeOff size={20} color={THEME.muted} />
                  )}
                </TouchableOpacity>
              </View>

              <Button
                onPress={handleSubmit}
                loading={loading}
                accessibilityLabel="Entrar"
              >
                Entrar
              </Button>

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footText}>
                Não tem conta?{" "}
                <Text
                  style={styles.link}
                  onPress={() => navigation.navigate("CreateAccount")}
                  accessibilityRole="link"
                >
                  Cadastre-se
                </Text>{" "}
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */
const stylesSafe = {
  safeArea: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  keyboard: {
    flex: 1,
  },
} as const;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // center everything horizontally
    paddingHorizontal: 4 * vw,
    paddingVertical: 4 * vh,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  // title uses vw but clamped so it won't be tiny on mobile or giant on web
  title: {
    fontSize: clamp(6 * vw, 20, 54),
    fontWeight: "900",
    color: THEME.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: clamp(2 * vw, 12, 18),
    color: THEME.muted,
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: THEME.card,
    padding: clamp(2.2 * vw, 14, 28),
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  label: {
    fontSize: clamp(1.6 * vw, 12, 18),
    color: THEME.text,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    color: THEME.text,
    backgroundColor: "rgba(255,255,255,0.02)",
    fontSize: clamp(1.6 * vw, 14, 18),
  },
  eyeBtn: {
    position: "absolute",
    right: 8,
    top: 12,
    padding: 6,
  },
  error: {
    marginTop: 10,
    color: THEME.danger,
    textAlign: "center",
    fontWeight: "600",
  },
  footer: {
    marginTop: 18,
    alignItems: "center",
  },
  footText: {
    fontSize: clamp(1.6 * vw, 12, 16),
    color: THEME.muted,
  },
  link: {
    color: THEME.accent,
    textDecorationLine: "underline",
    fontWeight: "700",
  },
});

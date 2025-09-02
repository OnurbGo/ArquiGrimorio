import Button from "@/components/Button";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../services/api";
import { useAuth } from "../utils/AuthContext";

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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
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
            placeholderTextColor="#9c9cae"
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
              placeholderTextColor="#9c9cae"
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
                <Eye size={20} color="#6b7280" />
              ) : (
                <EyeOff size={20} color="#6b7280" />
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
              style={{ color: "#2563eb", textDecorationLine: "underline" }}
              onPress={() => navigation.navigate("CreateAccount")}
              accessibilityRole="link"
            >
              Cadastre-se
            </Text>{" "}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  keyboard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f8fafc",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#9ca3af",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#0b1220",
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  label: {
    fontSize: 13,
    color: "#e6eef8",
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2b3440",
    color: "#f8fafc",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  eyeBtn: {
    position: "absolute",
    right: 8,
    top: 10,
    padding: 6,
  },
  button: {
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#2563eb",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  error: {
    marginTop: 10,
    color: "#fb7185",
  },
  footer: {
    marginTop: 14,
    alignItems: "center",
  },
  footText: {
    fontSize: 12,
    color: "#9ca3af",
  },
});

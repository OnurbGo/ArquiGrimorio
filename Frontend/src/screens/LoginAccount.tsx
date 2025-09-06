// LoginAccount.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Button from "@/components/Button";
import Navigation from "../components/Navigation";
import api from "../services/api";
import { useAuth } from "../utils/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // import styles from separate file
import { stylesSafe, styles, THEME } from "../style/loginAccount";

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
  const insets = useSafeAreaInsets();
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
    <View style={{paddingTop: insets.top + 10, ...stylesSafe.safeArea }}>
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
    </View>
  );
}

/* ---------- styles ---------- */

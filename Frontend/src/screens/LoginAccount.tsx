// src/screens/LoginAccount.tsx
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
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

  const handleSubmit = async () => {
    // validação simples
    if (!email.trim() || !password) {
      setError("Preencha email e senha.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const resp = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });
      // adapte caso seu backend retorne token em outro campo
      const token = resp?.data?.token ?? resp?.data?.accessToken ?? null;
      if (!token) throw new Error("Token não retornado pela API.");

      // login é assíncrono (persiste token); aguardamos antes de navegar
      await login(token);

      // navegar para Home após sucesso
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (err: any) {
      console.error("Login error:", err);
      if (axios.isAxiosError(err)) {
        // tenta pegar mensagem da API
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
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center p-6"
      >
        <View className="items-center mb-6">
          <Text className="text-3xl font-extrabold text-primary-foreground">
            ArquiGrimório
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            Portal de Itens Místicos
          </Text>
        </View>

        <View className="bg-card p-6 rounded-2xl shadow-elevated">
          <Text className="text-sm text-foreground font-semibold mb-2">
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="seu@exemplo.com"
            placeholderTextColor="#9c9cae"
            returnKeyType="next"
            onSubmitEditing={() => {
              // focar no próximo campo — RN padrão não tem ref aqui, então só abreviar
            }}
            className="px-3 py-2 rounded-md border border-border text-foreground bg-card-foreground/5"
          />

          <Text className="text-sm text-foreground font-semibold mt-4 mb-2">
            Senha
          </Text>
          <View className="relative">
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secure}
              placeholder="••••••••"
              placeholderTextColor="#9c9cae"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              className="px-3 py-2 rounded-md border border-border text-foreground bg-card-foreground/5 pr-12"
            />
            <TouchableOpacity
              className="absolute right-2 top-2"
              onPress={() => setSecure((s) => !s)}
              accessibilityLabel="alternar visibilidade senha"
            >
              {secure ? (
                <Eye size={20} color="#fff" />
              ) : (
                <EyeOff size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={`mt-6 px-4 py-3 rounded-md items-center ${
              loading ? "opacity-60" : ""
            } bg-primary`}
            onPress={handleSubmit}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Entrar"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold">Entrar</Text>
            )}
          </TouchableOpacity>

          {error ? (
            <Text className="text-destructive mt-3">{error}</Text>
          ) : null}
        </View>

        <View className="items-center mt-6">
          <Text className="text-sm text-muted-foreground">
            Não tem conta? Cadastre-se na versão web.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

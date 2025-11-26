import { useRef, useState, useCallback } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { isAxiosError } from "axios";
import Navigation from "@/components/Navigation";
import api from "@/services/api";
import { useAuth } from "@/utils/AuthContext";
import FormCard from "@/components/login/FormCard";

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


  const getErrorMessage = (err: unknown): string => {
    if (isAxiosError(err)) {
      const msg = err.response?.data?.message ?? err.response?.data ?? err.message;
      return typeof msg === "string" ? msg : "Erro ao autenticar";
    }
    if (err instanceof Error) return err.message;
    return "Erro ao autenticar";
  };
  const handleSubmit = useCallback(async () => {
    if (!email.trim() || !password) {
      setError("Preencha email e senha.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const resp = await api.post("/login", { email: email.trim(), password });
      const token = resp?.data?.token ?? resp?.data?.accessToken ?? null;
      if (!token) throw new Error("Token não retornado pela API.");

      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      await login(token);

      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [email, password, login, navigation]);

  return (
    <View
      className="flex-1 bg-[#0b1220]"
      style={[{ paddingTop: insets.top }]}
    >
      <Navigation />
      <View className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 justify-center items-center p-4">
            <View className="items-center mb-4">
              <Text className="text-4xl font-black text-slate-200 text-center">
                ArquiGrimório
              </Text>
              <Text className="mt-1.5 text-base text-slate-400 text-center">
                Portal de Itens Místicos
              </Text>
            </View>
            <FormCard email={email} setEmail={setEmail} password={password} setPassword={setPassword} secure={secure} setSecure={setSecure} error={error} setError={setError} passwordRef={passwordRef} handleSubmit={handleSubmit} loading={loading} />
            <View className="mt-4 items-center">
              <Text className="text-base text-slate-400">
                Não tem conta?{" "}
                <Text
                  className="text-[#7c5cff] underline font-bold"
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
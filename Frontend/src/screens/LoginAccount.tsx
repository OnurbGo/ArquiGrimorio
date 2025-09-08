// LoginAccount.tsx
import { useRef, useState, useCallback } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react-native";

import Button from "@/components/Button";
import Navigation from "@/components/Navigation";
import api from "@/services/api";
import { useAuth } from "@/utils/AuthContext";

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

  // INÍCIO COMPONENTE: GetErrorMessage
  const getErrorMessage = (err: unknown): string => {
    if (isAxiosError(err)) {
      const msg = err.response?.data?.message ?? err.response?.data ?? err.message;
      return typeof msg === "string" ? msg : "Erro ao autenticar";
    }
    if (err instanceof Error) return err.message;
    return "Erro ao autenticar";
  };
  // FIM COMPONENTE: GetErrorMessage

  // INÍCIO COMPONENTE: HandleSubmit
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
  // FIM COMPONENTE: HandleSubmit

  return (
    // INÍCIO COMPONENTE: ScreenContainer
    <View
      className="flex-1 bg-[#0b1220]"
      style={[{ paddingTop: insets.top }]}
    >
      {/* INÍCIO COMPONENTE: NavigationBar */}
      <Navigation />
      {/* FIM COMPONENTE: NavigationBar */}
      <View className="flex-1">
        {/* INÍCIO COMPONENTE: KeyboardAwareContainer */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* INÍCIO COMPONENTE: CenteredContentContainer */}
          <View className="flex-1 justify-center items-center p-4">
            {/* INÍCIO COMPONENTE: AuthHeader */}
            <View className="items-center mb-4">
              <Text className="text-4xl font-black text-slate-200 text-center">
                ArquiGrimório
              </Text>
              <Text className="mt-1.5 text-base text-slate-400 text-center">
                Portal de Itens Místicos
              </Text>
            </View>
            {/* FIM COMPONENTE: AuthHeader */}

            {/* INÍCIO COMPONENTE: FormCard */}
            <View className="w-full max-w-md bg-[#071525] p-6 rounded-2xl shadow-lg">
              {/* INÍCIO COMPONENTE: LabeledInput (Email) */}
              <Text className="text-base font-bold text-slate-200 mb-1.5">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (error) setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                placeholder="seu@exemplo.com"
                placeholderTextColor="#9ca3af"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                className="px-3 py-3 rounded-lg border border-white/5 bg-white/5 text-slate-200 text-base"
                accessible
                accessibilityLabel="Email"
              />
              {/* FIM COMPONENTE: LabeledInput (Email) */}

              <Text className="text-base font-bold text-slate-200 mb-1.5 mt-3">
                Senha
              </Text>
              {/* INÍCIO COMPONENTE: PasswordField */}
              <View className="relative">
                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (error) setError(null);
                  }}
                  secureTextEntry={secure}
                  autoComplete="password"
                  textContentType="password"
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="send"
                  onSubmitEditing={handleSubmit}
                  className="px-3 py-3 rounded-lg border border-white/5 bg-white/5 text-slate-200 text-base pr-11"
                  accessible
                  accessibilityLabel="Senha"
                />
                {/* INÍCIO COMPONENTE: ToggleVisibilityButton */}
                <TouchableOpacity
                  onPress={() => setSecure((s) => !s)}
                  accessibilityLabel="alternar visibilidade senha"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="absolute right-2 top-3 p-1.5"
                >
                  {secure ? (
                    <Eye size={20} color={"#9ca3af"} />
                  ) : (
                    <EyeOff size={20} color={"#9ca3af"} />
                  )}
                </TouchableOpacity>
                {/* FIM COMPONENTE: ToggleVisibilityButton */}
              </View>
              {/* FIM COMPONENTE: PasswordField */}

              {/* INÍCIO COMPONENTE: FormSubmitButton */}
              <Button
                onPress={handleSubmit}
                loading={loading}
                accessibilityLabel="Entrar"
              >
                Entrar
              </Button>
              {/* FIM COMPONENTE: FormSubmitButton */}

              {/* INÍCIO COMPONENTE: FormError */}
              {error ? (
                <Text className="mt-2.5 text-rose-400 text-center font-semibold">
                  {error}
                </Text>
              ) : null}
              {/* FIM COMPONENTE: FormError */}
            </View>
            {/* FIM COMPONENTE: FormCard */}

            {/* INÍCIO COMPONENTE: SignUpPrompt */}
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
            {/* FIM COMPONENTE: SignUpPrompt */}
          </View>
          {/* FIM COMPONENTE: CenteredContentContainer */}
        </KeyboardAvoidingView>
        {/* FIM COMPONENTE: KeyboardAwareContainer */}
      </View>
    </View>
    // FIM COMPONENTE: ScreenContainer
  );
}
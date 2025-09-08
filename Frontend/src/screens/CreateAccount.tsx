// CreateAccount.tsx
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Navigation from "../components/Navigation";
import ScreenContainer from "../components/ScreenContainer";
import { createUser } from "../hooks/user/user";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const validatePassword = (password: string): boolean => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return (
    password.length >= minLength && hasUppercase && hasNumber && hasSpecialChar
  );
};
const evaluatePasswordStrength = (password: string): string =>
  validatePassword(password) ? "Forte" : "Fraca";

export default function CreateAccount() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    url_img: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(false), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);
    setErrorAlert(false);

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Preencha todos os campos obrigatórios.");
      setErrorAlert(true);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      setErrorAlert(true);
      return;
    }

    try {
      const { name, email, password, url_img, description } = formData;
      await createUser({ name, email, password, url_img, description });
      setSuccess(true);
      setError("");
      setErrorAlert(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        url_img: "",
        description: "",
      });
      setPasswordStrength(null);
    } catch {
      setError("Erro ao registrar. Tente novamente.");
      setErrorAlert(true);
      setSuccess(false);
    }
  };

  return (
    <View style={{paddingTop: insets.top}} className="flex-1 bg-theme-bg">
      <Navigation />
      <ScreenContainer style={{ backgroundColor: "transparent" }}>
       <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
          className="px-3 lg:px-10 py-6 lg:py-12"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-3 lg:mb-7">
            <Text className="text-xl lg:text-5xl font-black text-theme-text text-center">ArquiGrimório</Text>
            <Text className="mt-1.5 text-xs lg:text-lg text-theme-muted text-center">Portal de Itens Místicos</Text>
          </View>

          <View className="w-full max-w-3xl bg-cardBg p-3.5 lg:p-7 rounded-2xl shadow-lg">
            {/* Nome */}
            <Text className="text-sm lg:text-lg font-bold text-theme-text mb-1.5 mt-2">Nome</Text>
            <TextInput
              className="bg-cardBg rounded-lg p-3 text-base lg:text-lg text-theme-text mb-2 border border-white/5"
              placeholder="Nome"
              placeholderTextColor="#9ca3af"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            {/* Email */}
            <Text className="text-sm lg:text-lg font-bold text-theme-text mb-1.5 mt-2">Email</Text>
            <TextInput
              className="bg-cardBg rounded-lg p-3 text-base lg:text-lg text-theme-text mb-2 border border-white/5"
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              value={formData.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />

            {/* Senha */}
            <Text className="text-sm lg:text-lg font-bold text-theme-text mb-1.5 mt-2">Senha</Text>
            <View className="relative">
              <TextInput
                className="bg-cardBg rounded-lg p-3 text-base lg:text-lg text-theme-text mb-2 border border-white/5 pr-11"
                placeholder="Senha"
                placeholderTextColor="#9ca3af"
                value={formData.password}
                secureTextEntry={!showPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  setPasswordStrength(evaluatePasswordStrength(text));
                }}
              />
              <TouchableOpacity
                className="absolute right-2 top-2.5 p-1.5"
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Feather name="eye-off" size={20} color="#9ca3af" />
                ) : (
                  <Feather name="eye" size={20} color="#9ca3af" />
                )}
              </TouchableOpacity>
            </View>
            {passwordStrength && (
              <Text
                className={`text-xs lg:text-base mt-1.5 font-bold ${
                  passwordStrength === "Fraca"
                    ? "text-theme-danger"
                    : "text-theme-success"
                }`}
              >
                Senha {passwordStrength}
              </Text>
            )}

            {/* Confirmar Senha */}
            <Text className="text-sm lg:text-lg font-bold text-theme-text mb-1.5 mt-2">Confirmar Senha</Text>
            <View className="relative">
              <TextInput
                className="bg-cardBg rounded-lg p-3 text-base lg:text-lg text-theme-text mb-2 border border-white/5 pr-11"
                placeholder="Confirmar Senha"
                placeholderTextColor="#9ca3af"
                value={formData.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
              />
              <TouchableOpacity
                className="absolute right-2 top-2.5 p-1.5"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <Feather name="eye-off" size={20} color="#9ca3af" />
                ) : (
                  <Feather name="eye" size={20} color="#9ca3af" />
                )}
              </TouchableOpacity>
            </View>

            {/* URL da imagem */}
            <Text className="text-sm lg:text-lg font-bold text-theme-text mb-1.5 mt-2">URL da Imagem</Text>
            <TextInput
              className="bg-cardBg rounded-lg p-3 text-base lg:text-lg text-theme-text mb-2 border border-white/5"
              placeholder="URL da imagem"
              placeholderTextColor="#9ca3af"
              value={formData.url_img}
              onChangeText={(text) =>
                setFormData({ ...formData, url_img: text })
              }
            />

            {/* Descrição */}
            <Text className="text-sm lg:text-lg font-bold text-theme-text mb-1.5 mt-2">Descrição</Text>
            <TextInput
              className="bg-cardBg rounded-lg p-3 text-base lg:text-lg text-theme-text mb-2 border border-white/5 h-20 lg:h-40"
              placeholder="Descrição"
              placeholderTextColor="#9ca3af"
              value={formData.description}
              multiline
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
            />

            {error ? <Text className="text-theme-danger text-xs lg:text-base mt-2 mb-1 text-center">{error}</Text> : null}

            <TouchableOpacity
              className="bg-theme-accent rounded-lg py-2.5 lg:py-4 items-center mt-3"
              onPress={handleSubmit}
              accessibilityRole="button"
            >
              <Text
                className="text-white font-bold text-sm lg:text-lg"
              >
                Cadastrar
              </Text>
            </TouchableOpacity>

            {success ? (
              <Text className="text-theme-success text-xs lg:text-base mt-2.5 text-center font-bold">
                Usuário cadastrado com sucesso!
              </Text>
            ) : null}
            {errorAlert && !success ? (
              <Text className="text-theme-danger text-xs lg:text-base mt-2 mb-1 text-center font-bold">
                {error || "Erro ao registrar. Tente novamente."}
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </ScreenContainer>
    </View>
  );
}
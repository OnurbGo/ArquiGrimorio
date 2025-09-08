// CreateAccount.tsx
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Navigation from "../components/Navigation";
import { createUser } from "../hooks/user/user";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LabeledName from "@/components/register/LabeledName";
import LabeledEmail from "@/components/register/LabeledEmail";
import LabeledPassword from "@/components/register/LabeledPassword";
import LabeledImage from "@/components/register/LabeledImage";
import LabeledDesc from "@/components/register/LabeledDesc";

// --- Helpers: validação de senha ---
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

// --- Tela: CreateAccount ---
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
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-theme-bg">
      <Navigation />
      <ScrollView style={{ backgroundColor: "transparent" }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
          className="px-3 lg:px-10 py-6 lg:py-12"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-3 lg:mb-7">
            <Text className="text-xl lg:text-5xl font-black text-theme-text text-center">ArquiGrimório</Text>
            <Text className="mt-1.5 text-xs lg:text-lg text-theme-muted text-center">Portal de Itens Místicos</Text>
          </View>

          {/* --- Card do formulário --- */}
          {/* INÍCIO COMPONENTE: FormCard */}
          <View className="w-full max-w-3xl bg-cardBg p-3.5 lg:p-7 rounded-2xl shadow-lg">
            <LabeledName formData={formData} setFormData={setFormData} />
            <LabeledEmail formData={formData} setFormData={setFormData} />
            <LabeledPassword formData={formData} setFormData={setFormData} passwordStrength={passwordStrength} setPasswordStrength={setPasswordStrength} showPassword={showPassword} setShowPassword={setShowPassword} evaluatePasswordStrength={evaluatePasswordStrength} showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword} />
            <LabeledImage formData={formData} setFormData={setFormData} />
            <LabeledDesc formData={formData} setFormData={setFormData} />
            {/* --- Mensagens de erro/sucesso --- */}
            {/* INÍCIO COMPONENTE: InlineError */}
            {error ? <Text className="text-theme-danger text-xs lg:text-base mt-2 mb-1 text-center">{error}</Text> : null}
            {/* FIM COMPONENTE: InlineError */}

            {/* INÍCIO COMPONENTE: PrimaryButton */}
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
            {/* FIM COMPONENTE: PrimaryButton */}

            {/* INÍCIO COMPONENTE: SuccessMessage */}
            {success ? (
              <Text className="text-theme-success text-xs lg:text-base mt-2.5 text-center font-bold">
                Usuário cadastrado com sucesso!
              </Text>
            ) : null}
            {/* FIM COMPONENTE: SuccessMessage */}
            {/* INÍCIO COMPONENTE: ErrorAlert */}
            {errorAlert && !success ? (
              <Text className="text-theme-danger text-xs lg:text-base mt-2 mb-1 text-center font-bold">
                {error || "Erro ao registrar. Tente novamente."}
              </Text>
            ) : null}
            {/* FIM COMPONENTE: ErrorAlert */}
          </View>
          {/* FIM COMPONENTE: FormCard */}
        </ScrollView>
        {/* FIM COMPONENTE: CenteredContentContainer */}
      </ScrollView>
      {/* FIM COMPONENTE: TransparentScrollWrapper */}
      {/* FIM COMPONENTE: ScreenContainer */}
    </View>
  );
}
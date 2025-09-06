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
import { styles, stylesSafe, THEME, vh, clamp, vw} from "../style/createAccount";

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
    <View style={{paddingTop: insets.top + 10, ...stylesSafe.safeArea}}/*stylesSafe.safeArea*/>
      <Navigation />
      <ScreenContainer style={{ backgroundColor: "transparent" }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>ArquiGrimório</Text>
            <Text style={styles.subtitle}>Portal de Itens Místicos</Text>
          </View>

          <View style={styles.cardLight}>
            {/* Nome */}
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.inputLight}
              placeholder="Nome"
              placeholderTextColor={THEME.muted}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.inputLight}
              placeholder="Email"
              placeholderTextColor={THEME.muted}
              value={formData.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />

            {/* Senha */}
            <Text style={styles.label}>Senha</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                style={[styles.inputLight, { paddingRight: 44 }]}
                placeholder="Senha"
                placeholderTextColor={THEME.muted}
                value={formData.password}
                secureTextEntry={!showPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  setPasswordStrength(evaluatePasswordStrength(text));
                }}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Feather name="eye-off" size={20} color={THEME.muted} />
                ) : (
                  <Feather name="eye" size={20} color={THEME.muted} />
                )}
              </TouchableOpacity>
            </View>
            {passwordStrength && (
              <Text
                style={[
                  styles.passwordStrength,
                  passwordStrength === "Fraca"
                    ? styles.passwordWeak
                    : styles.passwordStrong,
                ]}
              >
                Senha {passwordStrength}
              </Text>
            )}

            {/* Confirmar Senha */}
            <Text style={styles.label}>Confirmar Senha</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                style={[styles.inputLight, { paddingRight: 44 }]}
                placeholder="Confirmar Senha"
                placeholderTextColor={THEME.muted}
                value={formData.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <Feather name="eye-off" size={20} color={THEME.muted} />
                ) : (
                  <Feather name="eye" size={20} color={THEME.muted} />
                )}
              </TouchableOpacity>
            </View>

            {/* URL da imagem */}
            <Text style={styles.label}>URL da Imagem</Text>
            <TextInput
              style={styles.inputLight}
              placeholder="URL da imagem"
              placeholderTextColor={THEME.muted}
              value={formData.url_img}
              onChangeText={(text) =>
                setFormData({ ...formData, url_img: text })
              }
            />

            {/* Descrição */}
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.inputLight, { height: clamp(14 * vh, 80, 160) }]}
              placeholder="Descrição"
              placeholderTextColor={THEME.muted}
              value={formData.description}
              multiline
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.btn}
              onPress={handleSubmit}
              accessibilityRole="button"
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: clamp(1.8 * vw, 14, 18),
                }}
              >
                Cadastrar
              </Text>
            </TouchableOpacity>

            {success ? (
              <Text style={styles.success}>
                Usuário cadastrado com sucesso!
              </Text>
            ) : null}
            {errorAlert && !success ? (
              <Text style={styles.errorAlert}>
                {error || "Erro ao registrar. Tente novamente."}
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </ScreenContainer>
    </View>
  );
}

/* ---------- styles ---------- */


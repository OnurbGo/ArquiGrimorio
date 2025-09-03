// CreateAccount.tsx
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Navigation from "../components/Navigation";
import ScreenContainer from "../components/ScreenContainer";
import { createUser } from "../hooks/user/user";

/* ---------- responsive helpers ---------- */
const WIN = Dimensions.get("window");
const CAP_WIDTH = Math.min(WIN.width, 1200); // cap vw for web
const vw = CAP_WIDTH / 100;
const vh = WIN.height / 100;
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const THEME = {
  bg: "#0b1220",
  text: "#e6eef8",
  muted: "#9ca3af",
  accent: "#7c5cff",
  danger: "#ef4444",
  success: "#22c55e",
};

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
    <SafeAreaView style={stylesSafe.safeArea}>
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
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */
const stylesSafe = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
});

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center", // center horizontally
    justifyContent: "center",
    paddingVertical: clamp(4 * vh, 24, 48),
    paddingHorizontal: clamp(4 * vw, 12, 40),
  },
  header: {
    alignItems: "center",
    marginBottom: clamp(2 * vh, 12, 28),
  },
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
  cardLight: {
    width: "100%",
    maxWidth: 720,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: clamp(2.2 * vw, 14, 28),
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  label: {
    fontSize: clamp(1.8 * vw, 13, 18),
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 6,
    marginTop: 8,
  },
  inputLight: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 10,
    padding: 12,
    fontSize: clamp(1.8 * vw, 14, 18),
    color: THEME.text,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  eyeBtn: {
    position: "absolute",
    right: 8,
    top: Platform.OS === "web" ? 10 : 12,
    padding: 6,
  },
  passwordStrength: {
    fontSize: clamp(1.6 * vw, 12, 16),
    marginTop: 6,
    fontWeight: "700",
  },
  passwordWeak: { color: THEME.danger },
  passwordStrong: { color: THEME.success },
  error: {
    color: THEME.danger,
    fontSize: clamp(1.6 * vw, 12, 16),
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  btn: {
    backgroundColor: THEME.accent,
    borderRadius: 10,
    paddingVertical: clamp(1.6 * vh, 10, 16),
    alignItems: "center",
    marginTop: 12,
  },
  success: {
    color: THEME.success,
    fontSize: clamp(1.6 * vw, 12, 16),
    marginTop: 10,
    textAlign: "center",
    fontWeight: "700",
  },
  errorAlert: {
    color: THEME.danger,
    fontSize: clamp(1.6 * vw, 12, 16),
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
    fontWeight: "700",
  },
});

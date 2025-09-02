import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ScreenContainer from "../components/ScreenContainer";
import { createUser, CreateUserPayload } from "../services/api";

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: "#f3f4f6",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#374151",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  eyeBtn: {
    position: "absolute",
    right: 10,
    top: 12,
    padding: 4,
  },
  passwordStrength: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "bold",
  },
  passwordWeak: {
    color: "#ef4444",
  },
  passwordStrong: {
    color: "#22c55e",
  },
  error: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  errorAlert: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
    fontWeight: "bold",
  },
  btn: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  success: {
    color: "#22c55e",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 16,
    fontSize: 15,
    color: "#374151",
    textAlign: "center",
  },
  link: {
    color: "#4f46e5",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
});

// Função para validar senha
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

const CreateAccount = () => {
  // Estado do formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    url_img: "",
    description: "",
  });

  // Estados auxiliares
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);

  // Função para lidar com o submit
  const handleSubmit = async () => {
    setError("");
    setSuccess(false);
    setErrorAlert(false);

    // Validação básica
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
      const payload: CreateUserPayload = {
        name,
        email,
        password,
        url_img,
        description,
      };
      await createUser(payload);
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
    <ScreenContainer style={styles.bg}>
      <View style={styles.header}>
        <Text style={styles.title}>ArquiGrimório</Text>
        <Text style={styles.subtitle}>Portal de Itens Místicos</Text>
      </View>
      <View style={styles.card}>
        <View>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#9ca3af"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>
        <View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            value={formData.email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />
        </View>
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.label}>Senha</Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={[styles.input, { paddingRight: 40 }]}
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
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Feather name="eye-off" size={20} color="#6b7280" />
              ) : (
                <Feather name="eye" size={20} color="#6b7280" />
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
        </View>
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.label}>Confirmar Senha</Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={[styles.input, { paddingRight: 40 }]}
              placeholder="Confirmar Senha"
              placeholderTextColor="#9ca3af"
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
                <Feather name="eye-off" size={20} color="#6b7280" />
              ) : (
                <Feather name="eye" size={20} color="#6b7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <Text style={styles.label}>URL da Imagem</Text>
          <TextInput
            style={styles.input}
            placeholder="URL da imagem"
            placeholderTextColor="#9ca3af"
            value={formData.url_img}
            onChangeText={(text) => setFormData({ ...formData, url_img: text })}
          />
        </View>
        <View>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Descrição"
            placeholderTextColor="#9ca3af"
            value={formData.description}
            multiline
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            Cadastrar
          </Text>
        </TouchableOpacity>
        {success ? (
          <Text style={styles.success}>Usuário cadastrado com sucesso!</Text>
        ) : null}
        {errorAlert && !success ? (
          <Text style={styles.errorAlert}>
            {error || "Erro ao registrar. Tente novamente."}
          </Text>
        ) : null}
      </View>
    </ScreenContainer>
  );
};

export default CreateAccount;

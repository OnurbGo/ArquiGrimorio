import { Feather } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LabeledPassword({ formData, setFormData, passwordStrength, setPasswordStrength, showPassword, setShowPassword, evaluatePasswordStrength, showConfirmPassword, setShowConfirmPassword }: any) {
  return (
    <View className="mb-4">
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
            {/* FIM COMPONENTE: PasswordInputWithToggle (Senha) */}
            {/* INÍCIO COMPONENTE: PasswordStrengthBadge */}
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
            {/* FIM COMPONENTE: PasswordStrengthBadge */}

            {/* Confirmar Senha */}
            {/* INÍCIO COMPONENTE: PasswordInputWithToggle (Confirmar Senha) */}
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
    </View>
  );
}

import Button from "../Button";
import { View, TextInput, Text, TouchableOpacity} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

export default function FormCard({
  email,
  setEmail,
  password,
  setPassword,
  secure,
  setSecure,
  error,
  setError,
  passwordRef,
  handleSubmit,
  loading,
}: any) {
  return (
    <View className="w-full max-w-md bg-[#071525] p-6 rounded-2xl shadow-lg">
      {/* INÍCIO COMPONENTE: LabeledInput (Email) */}
      <Text className="text-base font-bold text-slate-200 mb-1.5">Email</Text>
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
          onPress={() => setSecure((s: any) => !s)}
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
  );
}

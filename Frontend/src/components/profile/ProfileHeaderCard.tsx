import { Image, Text, View } from "react-native";
import type { User } from "@/interface/User";

export function ProfileHeaderCard({ user }: { user: User }) {
    const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U";

  return (
    <View className="bg-white rounded-2xl p-4 border border-indigo-500/10 mb-3">
      <View className="flex-row items-center">
        {/* INÍCIO COMPONENTE: Avatar */}
        <View className="mr-3">
          {user.url_img ? (
            <Image
              source={{ uri: user.url_img }}
              className="w-24 h-24 rounded-full border-2 border-violet-700"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-indigo-100 items-center justify-center border-2 border-purple-200">
              <Text className="text-3xl font-extrabold text-violet-700">
                {initials}
              </Text>
            </View>
          )}
        </View>
        {/* FIM COMPONENTE: Avatar */}

        <View className="flex-1">
          {/* INÍCIO COMPONENTE: UserName */}
          <Text className="text-xl font-extrabold text-slate-900">
            {user.name || "Usuário"}
          </Text>
          {/* FIM COMPONENTE: UserName */}
          {/* INÍCIO COMPONENTE: RoleBadge */}
          <View className="mt-2 self-start bg-indigo-100 px-2.5 py-1 rounded-full">
            <Text className="text-indigo-600 font-bold">Criador</Text>
          </View>
          {/* FIM COMPONENTE: RoleBadge */}

          {/* INÍCIO COMPONENTE: Description */}
          <Text className="mt-2 text-slate-500">
            {user.description || "Este usuário não adicionou descrição."}
          </Text>
          {/* FIM COMPONENTE: Description */}
        </View>
      </View>
    </View>
  );
}

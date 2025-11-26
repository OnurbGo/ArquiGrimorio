import { Image, Text, View, Pressable } from "react-native";
import type { User } from "@/interface/User";
import api from "@/services/api";

export function ProfileHeaderCard({
  user,
  editable,
  onPressEdit,
}: {
  user: User;
  editable?: boolean;
  onPressEdit?: () => void;
}) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U";

  console.log(user.url_img)
    
  let resolvedUrl = `${api.defaults.baseURL}${user.url_img}`;
  console.log("URL do avatar antes da verificação:", resolvedUrl);

  return (
    <View className="bg-white rounded-2xl p-4 border border-indigo-500/10 mb-3">
      <View className="flex-row items-center">
        <View className="mr-3">
          {editable ? (
            <Pressable onPress={onPressEdit} className="relative">
              {resolvedUrl ? (
                <Image
                  source={{ uri: resolvedUrl }}
                  className="w-24 h-24 rounded-full border-2 border-violet-700"
                  onError={() => {
                    console.warn("Falha ao carregar avatar:", resolvedUrl);
                  }}
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-indigo-100 items-center justify-center border-2 border-purple-200">
                  <Text className="text-3xl font-extrabold text-violet-700">
                    {initials}
                  </Text>
                </View>
              )}
              <View className="absolute bottom-1 right-1 bg-violet-700 px-2 py-1 rounded-full">
                <Text className="text-white text-[11px] font-bold">Editar</Text>
              </View>
            </Pressable>
          ) : (
            <>
              {resolvedUrl ? (
                <Image
                  source={{ uri: resolvedUrl }}
                  className="w-24 h-24 rounded-full border-2 border-violet-700"
                  onError={() => {
                    console.warn("Falha ao carregar avatar:", resolvedUrl);
                  }}
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-indigo-100 items-center justify-center border-2 border-purple-200">
                  <Text className="text-3xl font-extrabold text-violet-700">
                    {initials}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-slate-900">
            {user.name || "Usuário"}
          </Text>
          <View className="mt-2 self-start bg-indigo-100 px-2.5 py-1 rounded-full">
            <Text className="text-indigo-600 font-bold">Criador</Text>
          </View>
          <Text className="mt-2 text-slate-500">
            {user.description || "Este usuário não adicionou descrição."}
          </Text>
        </View>
      </View>
    </View>
  );
}

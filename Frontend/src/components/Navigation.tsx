import { useNavigation } from "@react-navigation/native";
import {
  BookOpen,
  LogOut,
  Menu,
  Pen,
  Plus,
  Search,
  User as UserIcon,
} from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useAuth } from "../utils/AuthContext";
import useHookGetUser from "@/hooks/user/hookGetUser";
import api from "@/services/api";

const NAV_ITEMS = [
  { key: "Home", label: "Grimório", route: "Home", icon: BookOpen },
  { key: "Search", label: "Buscar", route: "Search", icon: Search },
  { key: "CreateItem", label: "Criar Item", route: "CreateItem", icon: Plus },
];

export default function Navigation() {
  const navigation: any = useNavigation();
  const { isAuthenticated, user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  function goTo(route: string, params?: Record<string, any>) {
    setHamburgerOpen(false);
    setAvatarMenuOpen(false);
    if (navigation?.navigate) navigation.navigate(route, params);
  }

  async function handleLogout() {
    try {
      await logout();
      goTo("Home");
    } catch (err) {
      console.warn("Logout failed:", err);
    }
  }

  const {getUser} = useHookGetUser();
  const avatarUrl = `${api.defaults.baseURL}${getUser?.url_img}`;
  const profileName = getUser?.name ?? null;
  console.log("Avatar URL:", avatarUrl);

  return (
    <View className="w-full bg-[#181825] border-b-2 border-b-[#7f32cc] py-[2%] px-[3%] pr-5 z-50">
      <View className="py-2.5 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => goTo("Home")}
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <BookOpen size={20} color="#fff" className="mr-2" />
            <Text className="text-base font-semibold text-white">
              Arquigrimório
            </Text>
          </TouchableOpacity>
        </View>

        {isWide ? (
          <View className="flex-row items-center">
            <View className="flex-row items-center justify-start gap-6 min-w-0">
              {/* Grimório */}
              <TouchableOpacity
                onPress={() => goTo("Home")}
                className="flex-row items-center ml-2 py-1.5 px-2.5 rounded-lg bg-[#23234a] shrink-0"
                activeOpacity={0.7}
              >
                <BookOpen size={18} color="#fff" />
                <Text className="ml-2 text-sm text-white">Grimório</Text>
              </TouchableOpacity>
              {/* Buscar */}
              <TouchableOpacity
                onPress={() => goTo("Search")}
                className="flex-row items-center ml-2 py-1.5 px-2.5 rounded-lg bg-[#23234a] shrink-0"
                activeOpacity={0.7}
              >
                <Search size={18} color="#fff" />
                <Text className="ml-2 text-sm text-white">Buscar</Text>
              </TouchableOpacity>
              {/* Criar Item - moved left, before avatar */}
              <TouchableOpacity
                onPress={() => goTo("CreateItem")}
                className="flex-row items-center ml-3 py-1.5 px-2.5 rounded-lg bg-[#7f32cc] relative z-20 shrink-0"
                activeOpacity={0.7}
              >
                <Plus size={18} color="#fff" />
                <Text className="ml-2 text-sm text-white">Criar Item</Text>
              </TouchableOpacity>
            </View>

            {!isAuthenticated ? (
              <TouchableOpacity
                onPress={() => goTo("Login")}
                className="ml-3 border border-[#7f32cc] px-3 py-1.5 rounded-full bg-[#23234a]"
              >
                <Text className="font-semibold text-white">Login</Text>
              </TouchableOpacity>
            ) : (
              <View className="ml-3 relative z-0 shrink-0 overflow-visible">
                <Pressable
                  onPress={() => setAvatarMenuOpen((s) => !s)}
                  className="p-0.5"
                  hitSlop={8}
                >
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      className="w-9 h-9 rounded-full border-2 border-[#7f32cc]"
                      onError={() => {
                        console.warn("Erro ao carregar imagem do avatar");
                      }}
                    />
                  ) : (
                    <View className="w-9 h-9 rounded-full bg-[#23234a] items-center justify-center">
                      <Text className="text-white font-bold">
                        {(profileName || "U")[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                </Pressable>

                {avatarMenuOpen && (
                  <View
                    className="absolute right-0 top-[46px] min-w-[160px] bg-[#23234a] rounded-lg border-2 border-[#7f32cc] shadow-lg shadow-[#7f32cc]/15 z-[99999] overflow-visible"
                    pointerEvents="auto"
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setAvatarMenuOpen(false);
                        goTo("UserProfile", { userId: user?.id ?? null });
                      }}
                      className="p-3 border-b border-b-[#7f32cc33]"
                      accessibilityRole="button"
                    >
                      <View className="flex-row items-center">
                        <UserIcon
                          size={16}
                          color="#fff"
                          className="mr-2"
                        />
                        <Text className="text-white">Ver Perfil</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Editar Item */}
                    <TouchableOpacity
                      onPress={() => {
                        setAvatarMenuOpen(false);
                        goTo("EditItem");
                      }}
                      className="p-3 border-b border-b-[#7f32cc33]"
                      accessibilityRole="button"
                    >
                      <View className="flex-row items-center">
                        <Pen
                          size={16}
                          color="#fff"
                          className="mr-2"
                        />
                        <Text className="text-white">Editar Item</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setAvatarMenuOpen(false);
                        handleLogout();
                      }}
                      className="p-3"
                      accessibilityRole="button"
                    >
                      <View className="flex-row items-center">
                        <LogOut
                          size={16}
                          color="#fff"
                          className="mr-2"
                        />
                        <Text className="text-white">Desconectar</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          <View className="flex-row items-center">
            {/* No mobile, só mostra o menu hamburger e login */}
            {!isAuthenticated ? null : null}
            <TouchableOpacity
              onPress={() => setHamburgerOpen((s) => !s)}
              className="p-[2%] ml-[1%]"
            >
              <Menu size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {hamburgerOpen && !isWide && (
        <View className="mt-[2%] bg-[#23234a] rounded-lg border-2 border-[#7f32cc] py-[1%] z-[9999]">
          {NAV_ITEMS.map((it) => (
            <TouchableOpacity
              key={it.key}
              onPress={() => goTo(it.route)}
              className="flex-row items-center py-[2%] px-[3%] border-b border-b-[#7f32cc33]"
            >
              <it.icon size={18} color="#fff" className="mr-2.5" />
              <Text className="text-[15px] text-white">{it.label}</Text>
            </TouchableOpacity>
          ))}

          {!isAuthenticated ? (
            <TouchableOpacity
              onPress={() => goTo("Login")}
              className="flex-row items-center py-[2%] px-[3%]"
            >
              <Menu size={18} color="#fff" className="mr-2.5" />
              <Text className="text-[15px] text-white">Login</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  setHamburgerOpen(false);
                  goTo("UserProfile", { userId: user?.id ?? null });
                }}
                className="flex-row items-center py-[2%] px-[3%] border-b border-b-[#7f32cc33]"
              >
                <UserIcon size={18} color="#fff" className="mr-2.5" />
                <Text className="text-[15px] text-white">Ver Perfil</Text>
              </TouchableOpacity>

              {/* Editar Item - mobile hamburger menu */}
              <TouchableOpacity
                onPress={() => {
                  setHamburgerOpen(false);
                  goTo("EditItem");
                }}
                className="flex-row items-center py-[2%] px-[3%] border-b border-b-[#7f32cc33]"
              >
                <Pen size={18} color="#fff" className="mr-2.5" />
                <Text className="text-[15px] text-white">Editar Item</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setHamburgerOpen(false);
                  handleLogout();
                }}
                className="flex-row items-center py-[2%] px-[3%]"
              >
                <LogOut size={18} color="#fff" className="mr-2.5" />
                <Text className="text-[15px] text-white">Desconectar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {avatarMenuOpen && !isWide && (
        <View className="mt-2 bg-[#23234a] rounded-lg border-2 border-[#7f32cc] py-1.5 z-[9999]">
          <TouchableOpacity
            onPress={() => {
              setAvatarMenuOpen(false);
              goTo("UserProfile", { userId: user?.id ?? null });
            }}
            className="flex-row items-center py-[2%] px-[3%] border-b border-b-[#7f32cc33]"
          >
            <UserIcon size={16} color="#fff" className="mr-2.5" />
            <Text className="text-white">Ver Perfil</Text>
          </TouchableOpacity>

          {/* Editar Item - mobile avatar menu */}
          <TouchableOpacity
            onPress={() => {
              setAvatarMenuOpen(false);
              goTo("EditItem");
            }}
            className="flex-row items-center py-[2%] px-[3%] border-b border-b-[#7f32cc33]"
          >
            <Pen size={16} color="#fff" className="mr-2.5" />
            <Text className="text-white">Editar Item</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setAvatarMenuOpen(false);
              handleLogout();
            }}
            className="flex-row items-center py-[2%] px-[3%]"
          >
            <LogOut size={16} color="#fff" className="mr-2.5" />
            <Text className="text-white">Desconectar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

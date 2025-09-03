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
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useAuth } from "../utils/AuthContext";

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

  const avatarUrl = user?.url_img ?? null;
  const profileName = user?.name ?? null;

  return (
    <View style={styles.container}>
      <View style={styles.innerRow}>
        <View style={styles.left}>
          <TouchableOpacity
            onPress={() => goTo("Home")}
            style={{ flexDirection: "row", alignItems: "center" }}
            activeOpacity={0.7}
          >
            <BookOpen size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={[styles.logoText, { color: "#fff" }]}>
              Arquigrimório
            </Text>
          </TouchableOpacity>
        </View>

        {isWide ? (
          <View style={styles.rightRow}>
            <View style={styles.itemsRowWithCreate}>
              {/* Grimório */}
              <TouchableOpacity
                onPress={() => goTo("Home")}
                style={styles.navItem}
                activeOpacity={0.7}
              >
                <BookOpen size={18} color="#fff" />
                <Text style={styles.navText}>Grimório</Text>
              </TouchableOpacity>
              {/* Buscar */}
              <TouchableOpacity
                onPress={() => goTo("Search")}
                style={styles.navItem}
                activeOpacity={0.7}
              >
                <Search size={18} color="#fff" />
                <Text style={styles.navText}>Buscar</Text>
              </TouchableOpacity>
              {/* Criar Item - moved left, before avatar */}
              <TouchableOpacity
                onPress={() => goTo("CreateItem")}
                style={styles.navItemCreate}
                activeOpacity={0.7}
              >
                <Plus size={18} color="#fff" />
                <Text style={styles.navText}>Criar Item</Text>
              </TouchableOpacity>
            </View>

            {!isAuthenticated ? (
              <TouchableOpacity
                onPress={() => goTo("Login")}
                style={styles.loginBtn}
              >
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.avatarArea, { overflow: "visible" }]}>
                <Pressable
                  onPress={() => setAvatarMenuOpen((s) => !s)}
                  style={styles.avatarPress}
                  hitSlop={8}
                >
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      style={styles.avatar}
                      onError={() => {
                        console.warn("Erro ao carregar imagem do avatar");
                      }}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarInitials}>
                        {(profileName || "U")[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                </Pressable>

                {avatarMenuOpen && (
                  <View style={styles.avatarMenu} pointerEvents="auto">
                    <TouchableOpacity
                      onPress={() => {
                        setAvatarMenuOpen(false);
                        goTo("UserProfile", { userId: user?.id ?? null });
                      }}
                      style={styles.avatarMenuItem}
                      accessibilityRole="button"
                    >
                      <View style={styles.menuItemRow}>
                        <UserIcon
                          size={16}
                          color="#fff"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={{ color: "#fff" }}>Ver Perfil</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Editar Item */}
                    <TouchableOpacity
                      onPress={() => {
                        setAvatarMenuOpen(false);
                        goTo("EditItem");
                      }}
                      style={styles.avatarMenuItem}
                      accessibilityRole="button"
                    >
                      <View style={styles.menuItemRow}>
                        <Pen
                          size={16}
                          color="#fff"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={{ color: "#fff" }}>Editar Item</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setAvatarMenuOpen(false);
                        handleLogout();
                      }}
                      style={styles.avatarMenuItem}
                      accessibilityRole="button"
                    >
                      <View style={styles.menuItemRow}>
                        <LogOut
                          size={16}
                          color="#fff"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={{ color: "#fff" }}>Desconectar</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.compactRow}>
            {/* No mobile, só mostra o menu hamburger e login */}
            {!isAuthenticated ? null : null}
            <TouchableOpacity
              onPress={() => setHamburgerOpen((s) => !s)}
              style={styles.iconBtn}
            >
              <Menu size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {hamburgerOpen && !isWide && (
        <View style={styles.mobileMenu}>
          {NAV_ITEMS.map((it) => (
            <TouchableOpacity
              key={it.key}
              onPress={() => goTo(it.route)}
              style={styles.mobileMenuItem}
            >
              <it.icon size={18} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.mobileMenuText}>{it.label}</Text>
            </TouchableOpacity>
          ))}

          {!isAuthenticated ? (
            <TouchableOpacity
              onPress={() => goTo("Login")}
              style={styles.mobileMenuItem}
            >
              <Menu size={18} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.mobileMenuText}>Login</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  setHamburgerOpen(false);
                  goTo("UserProfile", { userId: user?.id ?? null });
                }}
                style={styles.mobileMenuItem}
              >
                <UserIcon size={18} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.mobileMenuText}>Ver Perfil</Text>
              </TouchableOpacity>

              {/* Editar Item - mobile hamburger menu */}
              <TouchableOpacity
                onPress={() => {
                  setHamburgerOpen(false);
                  goTo("EditItem");
                }}
                style={styles.mobileMenuItem}
              >
                <Pen size={18} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.mobileMenuText}>Editar Item</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setHamburgerOpen(false);
                  handleLogout();
                }}
                style={styles.mobileMenuItem}
              >
                <LogOut size={18} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.mobileMenuText}>Desconectar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {avatarMenuOpen && !isWide && (
        <View style={styles.mobileAvatarMenu}>
          <TouchableOpacity
            onPress={() => {
              setAvatarMenuOpen(false);
              goTo("UserProfile", { userId: user?.id ?? null });
            }}
            style={styles.mobileMenuItem}
          >
            <UserIcon size={16} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ color: "#fff" }}>Ver Perfil</Text>
          </TouchableOpacity>

          {/* Editar Item - mobile avatar menu */}
          <TouchableOpacity
            onPress={() => {
              setAvatarMenuOpen(false);
              goTo("EditItem");
            }}
            style={styles.mobileMenuItem}
          >
            <Pen size={16} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ color: "#fff" }}>Editar Item</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setAvatarMenuOpen(false);
              handleLogout();
            }}
            style={styles.mobileMenuItem}
          >
            <LogOut size={16} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ color: "#fff" }}>Desconectar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  innerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  container: {
    width: "100%",
    backgroundColor: "#181825",
    borderBottomWidth: 2,
    borderBottomColor: "#7f32cc",
    paddingVertical: "2%",
    paddingHorizontal: "3%",
    paddingRight: 20,
    zIndex: 50,
  },
  left: { flexDirection: "row", alignItems: "center" },
  logoText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  itemsRowWithCreate: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start",
    gap: 24,
    minWidth: 0,
  },

  navItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#23234a",
    flexShrink: 0,
  },

  navItemCreate: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#7f32cc",
    position: "relative",
    zIndex: 20,
    flexShrink: 0,
  },

  navText: { marginLeft: 8, fontSize: 14, color: "#fff" },

  loginBtn: {
    marginLeft: 12,
    borderWidth: 1,
    borderColor: "#7f32cc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#23234a",
  },
  loginText: { fontWeight: "600", color: "#fff" },

  avatarArea: {
    marginLeft: 12,
    position: "relative",
    zIndex: 0,
    flexShrink: 0,
  },

  avatarPress: { padding: 2 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#7f32cc",
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#23234a",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { color: "#fff", fontWeight: "700" },

  avatarMenu: {
    position: "absolute",
    right: 0,
    top: 46,
    minWidth: 160,
    backgroundColor: "#23234a",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#7f32cc",
    shadowColor: "#7f32cc",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
    zIndex: 99999,
    overflow: "visible",
  },
  avatarMenuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#7f32cc33",
  },
  menuItemRow: { flexDirection: "row", alignItems: "center" },

  compactRow: { flexDirection: "row", alignItems: "center" },
  iconBtn: { padding: "2%", marginLeft: "1%" },
  loginBtnSmall: {
    marginLeft: "1%",
    borderWidth: 1,
    borderColor: "#7f32cc",
    paddingHorizontal: "2%",
    paddingVertical: "1%",
    borderRadius: 999,
    backgroundColor: "#23234a",
  },
  avatarPressSmall: { marginLeft: "1%" },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#7f32cc",
  },
  avatarFallbackSmall: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#23234a",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitialsSmall: { color: "#fff", fontWeight: "700", fontSize: 12 },

  mobileMenu: {
    marginTop: "2%",
    backgroundColor: "#23234a",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#7f32cc",
    paddingVertical: "1%",
    zIndex: 9999,
  },
  mobileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "2%",
    paddingHorizontal: "3%",
    borderBottomWidth: 1,
    borderBottomColor: "#7f32cc33",
  },
  mobileMenuText: { fontSize: 15, color: "#fff" },
  mobileAvatarMenu: {
    marginTop: 8,
    backgroundColor: "#23234a",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#7f32cc",
    paddingVertical: 6,
    zIndex: 9999,
  },
});

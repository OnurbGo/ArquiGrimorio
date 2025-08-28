// src/components/Navigation.tsx
import { useNavigation } from "@react-navigation/native";
import {
  BookOpen,
  LucideIcon,
  Menu,
  Plus,
  Search,
  User,
} from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Button } from "./Button";

interface NavigationItem {
  label: string;
  icon: LucideIcon;
  routeName: string;
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigation: any = useNavigation();

  const navigationItems: NavigationItem[] = [
    { label: "Grimório", icon: BookOpen, routeName: "Home" },
    { label: "Buscar", icon: Search, routeName: "Search" },
    { label: "Criar Item", icon: Plus, routeName: "CreateItem" },
    { label: "Perfil", icon: User, routeName: "UserProfile" },
    { label: "Login", icon: Menu, routeName: "Login" },
  ];

  function handleNavigate(item: NavigationItem) {
    if (item.routeName && navigation?.navigate) {
      navigation.navigate(item.routeName);
    }
  }

  return (
    <View className="p-3 bg-white">
      {/* Top bar */}
      <View className="flex-row items-center justify-between">
        {/* Logo / Home */}
        <Button
          onPress={() => handleNavigate(navigationItems[0])}
          variant="ghost"
          size="md"
        >
          <BookOpen size={20} className="mr-2" />
          <Text className="text-base font-medium">Grimório</Text>
        </Button>

        {/* Menu for larger screens (opcional em mobile, mas deixei pra reutilizar) */}
        <View className="flex-row items-center gap-2">
          {navigationItems.slice(1).map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.routeName}
                onPress={() => handleNavigate(item)}
                className="rounded-xl p-2"
              >
                <View className="flex-row items-center">
                  <Icon size={20} className="mr-2" />
                  <Text className="text-sm">{item.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Menu toggle (hamburguer) */}
        <TouchableOpacity
          onPress={() => setIsMenuOpen((v) => !v)}
          className="p-2 md:hidden"
        >
          <Menu size={20} />
        </TouchableOpacity>
      </View>

      {/* Collapsible menu */}
      {isMenuOpen && (
        <View className="mt-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.routeName}
                onPress={() => {
                  setIsMenuOpen(false);
                  handleNavigate(item);
                }}
                className="flex-row items-center gap-2 p-2"
              >
                <Icon size={20} />
                <Text className="text-sm">{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default Navigation;

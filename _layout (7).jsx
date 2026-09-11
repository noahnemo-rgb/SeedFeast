import { Tabs } from "expo-router";
import { Home, Search, Leaf, Bookmark, User } from "lucide-react-native";
import { useTheme } from "@/utils/theme";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={
        {
          // ... existing screenOptions ...
        }
      }
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="search/index"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Search color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="seeds/index"
        options={{
          title: "Seeds",
          tabBarIcon: ({ color, size }) => <Leaf color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="bookmarks/index"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ color, size }) => <Bookmark color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

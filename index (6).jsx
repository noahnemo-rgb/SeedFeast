import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, Bell, Trophy, ChevronRight, Star } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const {
    data: featuredChef,
    isLoading: loadingChef,
    refetch: refetchChef,
  } = useQuery({
    queryKey: ["featuredChef"],
    queryFn: async () => {
      const response = await fetch("/api/chefs/featured");
      if (!response.ok) throw new Error("Failed to fetch featured chef");
      return response.json();
    },
  });

  const {
    data: recipes,
    isLoading: loadingRecipes,
    refetch: refetchRecipes,
  } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const response = await fetch("/api/recipes");
      if (!response.ok) throw new Error("Failed to fetch recipes");
      return response.json();
    },
  });

  const onRefresh = () => {
    refetchChef();
    refetchRecipes();
  };

  if (!fontsLoaded || loadingChef || loadingRecipes) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6A3D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={styles.greeting}>Hello, Foodie! 👋</Text>
          <Text style={styles.subGreeting}>What are we cooking today?</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={24} color="#111111" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        {/* Chef of the Week Section */}
        {featuredChef && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Trophy size={20} color="#FFD700" />
                <Text style={styles.sectionTitle}>Chef of the Week</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.chefCard}
              onPress={() => router.push(`/chef/${featuredChef.id}`)}
            >
              <Image
                source={{
                  uri:
                    featuredChef.avatar ||
                    "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400",
                }}
                style={styles.chefImage}
                contentFit="cover"
              />
              <View style={styles.chefInfo}>
                <View style={styles.chefBadge}>
                  <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.chefBadgeText}>Featured</Text>
                </View>
                <Text style={styles.chefName}>{featuredChef.name}</Text>
                <Text style={styles.chefBio} numberOfLines={2}>
                  {featuredChef.bio ||
                    "Master of gourmet flavors and creative culinary arts."}
                </Text>
                <View style={styles.chefStats}>
                  <Text style={styles.chefStatText}>
                    {featuredChef.followers} Followers
                  </Text>
                  <View style={styles.dot} />
                  <Text style={styles.chefStatText}>
                    {featuredChef.likes} Likes
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#8C8C8C" />
            </TouchableOpacity>
          </View>
        )}

        {/* Popular Recipes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Recipes</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recipeScroll}
          >
            {recipes?.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
              >
                <Image
                  source={{ uri: recipe.image }}
                  style={styles.recipeImage}
                  contentFit="cover"
                />
                <View style={styles.recipeContent}>
                  <Text style={styles.recipeTitle} numberOfLines={1}>
                    {recipe.title}
                  </Text>
                  <View style={styles.recipeMeta}>
                    <Text style={styles.recipeMetaText}>{recipe.time}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.recipeMetaText}>
                      {recipe.difficulty}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Categories or other sections could go here */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  greeting: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: "#111111",
  },
  subGreeting: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  featuredSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#111111",
  },
  seeAll: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#FF6A3D",
  },
  chefCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chefImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  chefInfo: {
    flex: 1,
  },
  chefBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6A3D",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
    marginBottom: 4,
  },
  chefBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#FFFFFF",
  },
  chefName: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#111111",
  },
  chefBio: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  chefStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  chefStatText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#111111",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 8,
  },
  recipeScroll: {
    paddingRight: 20,
    gap: 16,
  },
  recipeCard: {
    width: 240,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  recipeImage: {
    width: "100%",
    height: 160,
  },
  recipeContent: {
    padding: 16,
  },
  recipeTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#111111",
  },
  recipeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  recipeMetaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#6B7280",
  },
});

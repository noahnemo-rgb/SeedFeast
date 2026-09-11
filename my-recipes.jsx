import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Plus, BookOpen } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { useAuth } from "@/utils/auth/useAuth";

export default function MyRecipesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Poppins_600SemiBold,
  });

  const { data: recipes, isLoading } = useQuery({
    queryKey: ["my-recipes"],
    queryFn: async () => {
      const response = await fetch("/api/recipes/mine");
      if (!response.ok) throw new Error("Failed to fetch my recipes");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  if (!fontsLoaded) {
    return null;
  }

  const RecipeCard = ({ recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
    >
      <Image source={{ uri: recipe.image }} style={styles.recipeCardImage} />
      <View style={styles.recipeCardContent}>
        <Text style={styles.recipeCardTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={styles.recipeCardMeta}>
          <Text style={styles.recipeCardMetaText}>{recipe.time}</Text>
          <Text style={styles.recipeCardMetaText}>{recipe.difficulty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#111111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Recipes</Text>
        <View style={{ width: 40 }} />
      </View>

      {!isAuthenticated ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Please Sign In</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Text style={styles.createButtonText}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#FF6A3D" />
        </View>
      ) : !recipes || recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <BookOpen size={48} color="#8C8C8C" strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>No Recipes Created</Text>
          <Text style={styles.emptySubtitle}>
            You haven't shared any recipes yet.{"\n"}
            Start sharing your culinary skills!
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/create-recipe")}
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.createButtonText}>Create First Recipe</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsGrid}>
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#111111",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  resultsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  recipeCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recipeCardImage: {
    width: "100%",
    height: 120,
  },
  recipeCardContent: {
    padding: 12,
  },
  recipeCardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#111111",
    marginBottom: 8,
    height: 40,
  },
  recipeCardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recipeCardMetaText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#FF6A3D",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: "#111111",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6A3D",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  createButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});

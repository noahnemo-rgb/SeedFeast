import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { Search as SearchIcon, X, Heart } from "lucide-react-native";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Poppins_600SemiBold,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);

      const response = await fetch(`/api/recipes/search?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to search recipes");
      return response.json();
    },
    enabled: searchQuery.length > 0 || selectedCategory !== null,
  });

  if (!fontsLoaded) {
    return null;
  }

  const categories = categoriesData?.categories || [];
  const recipes = searchResults?.recipes || [];

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
        <Text style={styles.recipeCardChef} numberOfLines={1}>
          By {recipe.chef_name}
        </Text>
        <View style={styles.recipeCardMeta}>
          <Text style={styles.recipeCardMetaText}>{recipe.time}</Text>
          <Text style={styles.recipeCardMetaText}>{recipe.difficulty}</Text>
        </View>
      </View>
      {recipe.is_favorite && (
        <View style={styles.favoriteIcon}>
          <Heart size={12} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Recipes</Text>

        <View style={styles.searchContainer}>
          <SearchIcon size={20} color="#8C8C8C" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for recipes..."
            placeholderTextColor="#8C8C8C"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color="#8C8C8C" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={{ flexGrow: 0 }}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === null && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === null && styles.categoryChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id &&
                    styles.categoryChipTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!searchQuery && !selectedCategory ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <SearchIcon size={48} color="#8C8C8C" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>Start Searching</Text>
            <Text style={styles.emptySubtitle}>
              Find your next favorite recipe{"\n"}
              by searching or selecting a category
            </Text>
          </View>
        ) : isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptySubtitle}>Searching...</Text>
          </View>
        ) : recipes.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <SearchIcon size={48} color="#8C8C8C" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptySubtitle}>
              Try different keywords or{"\n"}
              select another category
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsCount}>
              {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} found
            </Text>
            <View style={styles.resultsGrid}>
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#F8F8F8",
  },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 28,
    color: "#111111",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EDEDED",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#111111",
    marginLeft: 12,
  },
  categoriesContainer: {
    paddingRight: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EDEDED",
    backgroundColor: "#FFFFFF",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#FF6A3D",
    borderColor: "#FF6A3D",
  },
  categoryChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#111111",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
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
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  resultsCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#8C8C8C",
    marginBottom: 16,
  },
  resultsGrid: {
    gap: 12,
  },
  recipeCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EDEDED",
    overflow: "hidden",
    marginBottom: 12,
  },
  recipeCardImage: {
    width: 100,
    height: 100,
  },
  recipeCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  recipeCardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#111111",
    marginBottom: 4,
  },
  recipeCardChef: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#8C8C8C",
    marginBottom: 8,
  },
  recipeCardMeta: {
    flexDirection: "row",
    gap: 12,
  },
  recipeCardMetaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#6E6E73",
  },
  favoriteIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF6A3D",
    alignItems: "center",
    justifyContent: "center",
  },
});

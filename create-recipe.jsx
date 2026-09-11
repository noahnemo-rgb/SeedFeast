import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "/apps/mobile/src/utils/auth/useAuth.js";
import useUser from "/apps/mobile/src/utils/auth/useUser.js";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { ChevronLeft, Plus, X, Camera } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function CreateRecipeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isReady } = useAuth();
  const { data: user } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [time, setTime] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [calories, setCalories] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [steps, setSteps] = useState([{ title: "", description: "" }]);

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

  const createRecipeMutation = useMutation({
    mutationFn: async (recipeData) => {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipeData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create recipe");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["recipes"]);
      Alert.alert("Success!", "Your recipe has been created", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  if (!fontsLoaded) {
    return null;
  }

  if (!isReady) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#FF6A3D" />
      </View>
    );
  }

  if (!isAuthenticated) {
    Alert.alert("Sign In Required", "Please sign in to create recipes", [
      { text: "OK", onPress: () => router.back() },
    ]);
    return null;
  }

  const categories = categoriesData?.categories || [];
  const difficulties = ["Easy", "Medium", "Hard"];

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, { title: "", description: "" }]);
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Missing Info", "Please enter a recipe title");
      return;
    }
    if (!categoryId) {
      Alert.alert("Missing Info", "Please select a category");
      return;
    }

    const validIngredients = ingredients.filter((i) => i.trim().length > 0);
    const validSteps = steps.filter((s) => s.title.trim().length > 0);

    createRecipeMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      image:
        imageUrl.trim() ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
      category_id: categoryId,
      time: time.trim() || "30 min",
      difficulty,
      calories: calories.trim() || "300 cal",
      ingredients: validIngredients,
      steps: validSteps,
    });
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#111111" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Recipe</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Info</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Recipe Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Chocolate Chip Cookies"
                placeholderTextColor="#8C8C8C"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What makes this recipe special?"
                placeholderTextColor="#8C8C8C"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor="#8C8C8C"
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      categoryId === cat.id && styles.chipActive,
                    ]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        categoryId === cat.id && styles.chipTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.row}>
              <View
                style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}
              >
                <Text style={styles.label}>Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30 min"
                  placeholderTextColor="#8C8C8C"
                  value={time}
                  onChangeText={setTime}
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Calories</Text>
                <TextInput
                  style={styles.input}
                  placeholder="300 cal"
                  placeholderTextColor="#8C8C8C"
                  value={calories}
                  onChangeText={setCalories}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.difficultyContainer}>
                {difficulties.map((diff) => (
                  <TouchableOpacity
                    key={diff}
                    style={[
                      styles.difficultyChip,
                      difficulty === diff && styles.chipActive,
                    ]}
                    onPress={() => setDifficulty(diff)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        difficulty === diff && styles.chipTextActive,
                      ]}
                    >
                      {diff}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addIngredient}
              >
                <Plus size={18} color="#FF6A3D" strokeWidth={2} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.listItem}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={`Ingredient ${index + 1}`}
                  placeholderTextColor="#8C8C8C"
                  value={ingredient}
                  onChangeText={(value) => updateIngredient(index, value)}
                />
                {ingredients.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeIngredient(index)}
                  >
                    <X size={18} color="#FF3B30" strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cooking Steps</Text>
              <TouchableOpacity style={styles.addButton} onPress={addStep}>
                <Plus size={18} color="#FF6A3D" strokeWidth={2} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepNumber}>Step {index + 1}</Text>
                  {steps.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeStep(index)}
                    >
                      <X size={18} color="#FF3B30" strokeWidth={2} />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Step title"
                  placeholderTextColor="#8C8C8C"
                  value={step.title}
                  onChangeText={(value) => updateStep(index, "title", value)}
                />
                <TextInput
                  style={[styles.input, styles.textArea, { marginTop: 8 }]}
                  placeholder="Step description (optional)"
                  placeholderTextColor="#8C8C8C"
                  value={step.description}
                  onChangeText={(value) =>
                    updateStep(index, "description", value)
                  }
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              createRecipeMutation.isPending && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={createRecipeMutation.isPending}
          >
            {createRecipeMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create Recipe</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingAnimatedView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8F8F8",
    borderBottomWidth: 1,
    borderBottomColor: "#EDEDED",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#111111",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#111111",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#111111",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDEDED",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#111111",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
  },
  chipScroll: {
    flexGrow: 0,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EDEDED",
    backgroundColor: "#FFFFFF",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#FF6A3D",
    borderColor: "#FF6A3D",
  },
  chipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#111111",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  difficultyContainer: {
    flexDirection: "row",
    gap: 8,
  },
  difficultyChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EDEDED",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#FF6A3D",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FFE5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  stepItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EDEDED",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  stepNumber: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FF6A3D",
  },
  footer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EDEDED",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  submitButton: {
    backgroundColor: "#FF6A3D",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});

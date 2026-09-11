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
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Share2,
  Heart,
  Users,
  Utensils,
  Star,
  Trophy,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins";

export default function ChefProfileScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Poppins_600SemiBold,
  });

  const {
    data: chef,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chef", id],
    queryFn: async () => {
      const response = await fetch(`/api/chefs/${id}`);
      if (!response.ok) throw new Error("Failed to fetch chef");
      return response.json();
    },
  });

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6A3D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#111111" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Share2 size={22} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Heart size={22} color="#111111" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: chef?.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
            {chef?.is_featured && (
              <View style={styles.featuredBadge}>
                <Trophy size={16} color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.nameContainer}>
            <Text style={styles.name}>{chef?.name}</Text>
            {chef?.is_featured && (
              <View style={styles.chefOfTheWeekBadge}>
                <Star size={12} color="#FF6A3D" fill="#FF6A3D" />
                <Text style={styles.chefOfTheWeekText}>Chef of the Week</Text>
              </View>
            )}
          </View>
          <Text style={styles.role}>{chef?.role}</Text>
          <Text style={styles.bio}>{chef?.bio}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{chef?.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{chef?.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{chef?.likes}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>
        </View>

        <View style={styles.recipesSection}>
          <View style={styles.sectionHeader}>
            <Utensils size={20} color="#111111" />
            <Text style={styles.sectionTitle}>Recipes</Text>
          </View>
          {/* rest of recipes list */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
  },
  featuredBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFD700",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  nameContainer: {
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    color: "#111111",
  },
  chefOfTheWeekBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    gap: 4,
  },
  chefOfTheWeekText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#FF6A3D",
  },
  role: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#FF6A3D",
    marginBottom: 12,
  },
  bio: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    justifyContent: "space-around",
    marginBottom: 32,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#111111",
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  recipesSection: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#111111",
  },
});

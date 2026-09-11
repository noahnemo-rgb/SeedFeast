import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "/apps/mobile/src/utils/auth/useAuth.js";
import useUser from "/apps/mobile/src/utils/auth/useUser.js";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { User, LogOut, Plus, BookOpen, Settings } from "lucide-react-native";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn, signOut, isAuthenticated, isReady } = useAuth();
  const { data: user, loading: userLoading } = useUser();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  if (!isReady) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <User size={64} color="#8C8C8C" strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>Sign In to Continue</Text>
          <Text style={styles.subtitle}>
            Create an account to save recipes,{"\n"}share your creations, and
            more
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => signIn()}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#FFFFFF" strokeWidth={2} />
            </View>
          </View>
          <Text style={styles.profileName}>{user?.name || "Food Lover"}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/create-recipe")}
          >
            <View
              style={[styles.menuIconContainer, { backgroundColor: "#FF6A3D" }]}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Create Recipe</Text>
              <Text style={styles.menuItemSubtitle}>
                Share your cooking creations
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/my-recipes")}
          >
            <View
              style={[styles.menuIconContainer, { backgroundColor: "#2E7D32" }]}
            >
              <BookOpen size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>My Recipes</Text>
              <Text style={styles.menuItemSubtitle}>
                View recipes you've created
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => console.log("Settings")}
          >
            <View
              style={[styles.menuIconContainer, { backgroundColor: "#1976D2" }]}
            >
              <Settings size={20} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Settings</Text>
              <Text style={styles.menuItemSubtitle}>
                Manage your preferences
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => signOut()}
        >
          <LogOut size={20} color="#FF3B30" strokeWidth={2} />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#8C8C8C",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 24,
    color: "#111111",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  signInButton: {
    backgroundColor: "#FF6A3D",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
  },
  signInButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 28,
    color: "#111111",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF6A3D",
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: "#111111",
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#8C8C8C",
  },
  section: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#111111",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#8C8C8C",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFE5E5",
    padding: 16,
    gap: 8,
  },
  signOutButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FF3B30",
  },
});

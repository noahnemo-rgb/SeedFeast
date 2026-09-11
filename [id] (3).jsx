import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Clock,
  Flame,
  BarChart2,
  Heart,
  Share2,
  User,
  MessageCircle,
  Send,
  ThumbsUp,
  CornerDownRight,
  X,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import * as Clipboard from "expo-clipboard";
import { useAuth } from "@/utils/auth/useAuth";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Poppins_600SemiBold,
  });

  const {
    data: recipe,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const response = await fetch(`/api/recipes/${id}`);
      if (!response.ok) throw new Error("Failed to fetch recipe");
      return response.json();
    },
  });

  const { data: comments, isLoading: loadingComments } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const response = await fetch(`/api/recipes/${id}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
  });

  const postCommentMutation = useMutation({
    mutationFn: async ({ content, parent_id }) => {
      const response = await fetch(`/api/recipes/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parent_id }),
      });
      if (!response.ok) throw new Error("Failed to post comment");
      return response.json();
    },
    onSuccess: () => {
      setCommentText("");
      setReplyTo(null);
      queryClient.invalidateQueries(["comments", id]);
    },
    onError: () => {
      Alert.alert("Error", "Please sign in to post a comment");
    },
  });

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    postCommentMutation.mutate({
      content: commentText,
      parent_id: replyTo?.id,
    });
  };

  const toggleCommentLikeMutation = useMutation({
    mutationFn: async (commentId) => {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to toggle like");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", id]);
    },
    onError: () => {
      Alert.alert("Error", "Please sign in to like comments");
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/recipes/${id}/favorite`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to toggle favorite");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["recipe", id]);
      queryClient.invalidateQueries(["favorites"]);
    },
    onError: (error) => {
      Alert.alert("Error", "Please sign in to favorite recipes");
    },
  });

  const handleShare = async () => {
    const recipeUrl = `https://gourmet.app/recipe/${id}`;
    await Clipboard.setStringAsync(recipeUrl);
    Alert.alert(
      "Link Copied!",
      "Recipe link has been copied to your clipboard.",
    );
  };

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6A3D" />
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Recipe not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const CommentItem = ({ comment, isReply = false }) => {
    const isChef = comment.user_id === comment.recipe_chef_id;

    return (
      <View style={[styles.commentItem, isReply && styles.replyItem]}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUserAvatar}>
            {comment.user_image ? (
              <Image
                source={{ uri: comment.user_image }}
                style={styles.avatarImage}
              />
            ) : (
              <User size={16} color="#8C8C8C" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.commentNameRow}>
              <Text style={styles.commentUserName}>{comment.user_name}</Text>
              {isChef && (
                <View style={styles.chefBadge}>
                  <Text style={styles.chefBadgeText}>Chef</Text>
                </View>
              )}
            </View>
            <Text style={styles.commentDate}>
              {new Date(comment.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>

        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.commentAction}
            onPress={() => toggleCommentLikeMutation.mutate(comment.id)}
          >
            <ThumbsUp
              size={14}
              color={comment.is_liked ? "#FF6A3D" : "#8C8C8C"}
              fill={comment.is_liked ? "#FF6A3D" : "transparent"}
            />
            <Text
              style={[
                styles.commentActionText,
                comment.is_liked && { color: "#FF6A3D" },
              ]}
            >
              {comment.likes_count || 0}
            </Text>
          </TouchableOpacity>

          {!isReply && (
            <TouchableOpacity
              style={styles.commentAction}
              onPress={() => {
                setReplyTo(comment);
                setCommentText("");
              }}
            >
              <MessageCircle size={14} color="#8C8C8C" />
              <Text style={styles.commentActionText}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>

        {comment.replies?.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingAnimatedView style={styles.container} behavior="padding">
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.image }}
            style={styles.image}
            contentFit="cover"
          />
          <View style={[styles.headerOverlay, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                <Share2 size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => toggleFavoriteMutation.mutate()}
              >
                <Heart
                  size={22}
                  color={recipe.is_favorited ? "#FF3B30" : "#FFFFFF"}
                  fill={recipe.is_favorited ? "#FF3B30" : "transparent"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>

          <TouchableOpacity
            style={styles.chefContainer}
            onPress={() => router.push(`/chef/${recipe.chef.id}`)}
          >
            <View style={styles.chefAvatar}>
              {recipe.chef.avatar ? (
                <Image
                  source={{ uri: recipe.chef.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <User size={20} color="#8C8C8C" />
              )}
            </View>
            <View>
              <Text style={styles.chefName}>{recipe.chef.name}</Text>
              <Text style={styles.chefRole}>{recipe.chef.role}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Clock size={18} color="#FF6A3D" />
              <Text style={styles.metaText}>{recipe.time}</Text>
            </View>
            <View style={styles.metaItem}>
              <BarChart2 size={18} color="#FF6A3D" />
              <Text style={styles.metaText}>{recipe.difficulty}</Text>
            </View>
            <View style={styles.metaItem}>
              <Flame size={18} color="#FF6A3D" />
              <Text style={styles.metaText}>{recipe.calories}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{recipe.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.steps.map((step, index) => (
              <View key={step.id} style={styles.stepItem}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Comments Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MessageCircle size={20} color="#111111" />
              <Text style={styles.sectionTitle}>Comments</Text>
            </View>

            {isAuthenticated && (
              <View style={styles.commentInputWrapper}>
                {replyTo && (
                  <View style={styles.replyingToContainer}>
                    <Text style={styles.replyingToText}>
                      Replying to{" "}
                      <Text style={{ fontWeight: "600" }}>
                        {replyTo.user_name}
                      </Text>
                    </Text>
                    <TouchableOpacity onPress={() => setReplyTo(null)}>
                      <X size={16} color="#8C8C8C" />
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.commentInputContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder={
                      replyTo ? "Write a reply..." : "Add a comment..."
                    }
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      !commentText.trim() && styles.sendButtonDisabled,
                    ]}
                    onPress={handlePostComment}
                    disabled={
                      postCommentMutation.isPending || !commentText.trim()
                    }
                  >
                    {postCommentMutation.isPending ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Send size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {loadingComments ? (
              <ActivityIndicator
                size="small"
                color="#FF6A3D"
                style={{ marginTop: 20 }}
              />
            ) : (
              <View style={styles.commentsList}>
                {comments?.length === 0 ? (
                  <Text style={styles.noComments}>
                    No comments yet. Be the first to share your thoughts!
                  </Text>
                ) : (
                  comments?.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: "#111111",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#FF6A3D",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 400,
    width: "100%",
  },
  image: {
    flex: 1,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    padding: 24,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 28,
    color: "#111111",
    marginBottom: 16,
  },
  chefContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  chefAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  chefName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#111111",
  },
  chefRole: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#8C8C8C",
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF5F2",
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#111111",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#111111",
    marginBottom: 12,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 24,
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF6A3D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  stepNumber: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#111111",
    marginBottom: 4,
  },
  stepDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    padding: 12,
    marginBottom: 24,
  },
  commentInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#111111",
    maxHeight: 100,
    paddingTop: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF6A3D",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: "#FFB59E",
  },
  commentsList: {
    gap: 20,
  },
  commentItem: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 16,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  commentUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  commentUserName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#111111",
  },
  commentDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#8C8C8C",
  },
  commentContent: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  noComments: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#8C8C8C",
    textAlign: "center",
    marginTop: 10,
  },
  commentNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chefBadge: {
    backgroundColor: "#FF6A3D",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chefBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  commentActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentActionText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#8C8C8C",
  },
  repliesContainer: {
    marginTop: 16,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#E5E7EB",
  },
  replyItem: {
    backgroundColor: "transparent",
    padding: 0,
    marginTop: 16,
  },
  commentInputWrapper: {
    marginBottom: 24,
  },
  replyingToContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  replyingToText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#6B7280",
  },
});

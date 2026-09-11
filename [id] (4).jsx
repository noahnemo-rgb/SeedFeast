import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  MapPin,
  Star,
  MessageCircle,
  Bookmark,
} from "lucide-react-native";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";

export default function SeedDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: user } = useUser();
  const { signIn, isReady } = useAuth();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/seeds/listings/${id}`);
      if (!response.ok) throw new Error("Failed to fetch listing");
      const data = await response.json();
      setListing(data.listing);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching listing:", error);
      Alert.alert("Error", "Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!isReady || !user) {
      signIn();
      return;
    }

    if (!message.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    try {
      setSendingMessage(true);
      const response = await fetch("/api/seeds/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.id,
          receiver_id: listing.user_id,
          message: message.trim(),
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      Alert.alert("Success", "Message sent!");
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!isReady || !user) {
      signIn();
      return;
    }

    try {
      const response = await fetch("/api/seeds/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.id,
          reviewed_user_id: listing.user_id,
          rating,
          comment: reviewComment.trim() || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      Alert.alert("Success", "Review submitted!");
      setShowReviewForm(false);
      setReviewComment("");
      fetchListing();
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review");
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, color: "#6B6B6B" }}>
          Listing not found
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="light" />

      {/* Header Image */}
      {listing.image ? (
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: listing.image }}
            style={{ width: "100%", height: 300 }}
            resizeMode="cover"
          />
          <View
            style={{
              position: "absolute",
              top: insets.top + 16,
              left: 20,
              right: 20,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(0,0,0,0.6)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ChevronLeft color="#fff" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="#000" size={28} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 20 }}>
          {/* Title & Type */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: "#000",
                  marginBottom: 8,
                }}
              >
                {listing.title}
              </Text>
              {listing.category_name && (
                <Text style={{ fontSize: 16, color: "#6B6B6B" }}>
                  {listing.category_icon} {listing.category_name}
                </Text>
              )}
            </View>
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor:
                  listing.listing_type === "offer" ? "#ECFDF5" : "#FEF3C7",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color:
                    listing.listing_type === "offer" ? "#059669" : "#D97706",
                }}
              >
                {listing.listing_type === "offer" ? "Offering" : "Requesting"}
              </Text>
            </View>
          </View>

          {/* Exchange Info */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {listing.exchange_type === "free" && (
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  backgroundColor: "#ECFDF5",
                }}
              >
                <Text
                  style={{ fontSize: 14, color: "#059669", fontWeight: "600" }}
                >
                  FREE
                </Text>
              </View>
            )}
            {listing.exchange_type === "trade" && (
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  backgroundColor: "#EFF6FF",
                }}
              >
                <Text
                  style={{ fontSize: 14, color: "#2563EB", fontWeight: "600" }}
                >
                  TRADE
                </Text>
              </View>
            )}
            {listing.exchange_type === "sell" && listing.price && (
              <Text
                style={{ fontSize: 24, fontWeight: "bold", color: "#10B981" }}
              >
                ${parseFloat(listing.price).toFixed(2)}
              </Text>
            )}
            {listing.organic && (
              <Text style={{ fontSize: 14, color: "#059669" }}>🌿 Organic</Text>
            )}
            {listing.heirloom && (
              <Text style={{ fontSize: 14, color: "#8B5CF6" }}>
                👑 Heirloom
              </Text>
            )}
          </View>

          {/* Description */}
          {listing.description && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, color: "#374151", lineHeight: 24 }}>
                {listing.description}
              </Text>
            </View>
          )}

          {/* Details Grid */}
          <View
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}
          >
            {listing.quantity && (
              <View style={{ marginBottom: 12 }}>
                <Text
                  style={{ fontSize: 14, color: "#6B6B6B", marginBottom: 4 }}
                >
                  Quantity
                </Text>
                <Text
                  style={{ fontSize: 16, color: "#000", fontWeight: "600" }}
                >
                  {listing.quantity}
                </Text>
              </View>
            )}
            {listing.growing_season && (
              <View style={{ marginBottom: 12 }}>
                <Text
                  style={{ fontSize: 14, color: "#6B6B6B", marginBottom: 4 }}
                >
                  Growing Season
                </Text>
                <Text
                  style={{ fontSize: 16, color: "#000", fontWeight: "600" }}
                >
                  {listing.growing_season}
                </Text>
              </View>
            )}
            {listing.days_to_harvest && (
              <View style={{ marginBottom: 12 }}>
                <Text
                  style={{ fontSize: 14, color: "#6B6B6B", marginBottom: 4 }}
                >
                  Days to Harvest
                </Text>
                <Text
                  style={{ fontSize: 16, color: "#000", fontWeight: "600" }}
                >
                  {listing.days_to_harvest}
                </Text>
              </View>
            )}
            {listing.difficulty && (
              <View style={{ marginBottom: 12 }}>
                <Text
                  style={{ fontSize: 14, color: "#6B6B6B", marginBottom: 4 }}
                >
                  Difficulty
                </Text>
                <Text
                  style={{ fontSize: 16, color: "#000", fontWeight: "600" }}
                >
                  {listing.difficulty}
                </Text>
              </View>
            )}
            {listing.location_city && (
              <View>
                <Text
                  style={{ fontSize: 14, color: "#6B6B6B", marginBottom: 4 }}
                >
                  Location
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MapPin color="#10B981" size={16} />
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#000",
                      fontWeight: "600",
                      marginLeft: 6,
                    }}
                  >
                    {listing.location_city}
                    {listing.location_state
                      ? `, ${listing.location_state}`
                      : ""}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* User Info */}
          <View
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#000",
                marginBottom: 12,
              }}
            >
              Listed by
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {listing.user_image ? (
                <Image
                  source={{ uri: listing.user_image }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                />
              ) : (
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#E5E7EB",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#6B6B6B",
                    }}
                  >
                    {listing.user_name?.charAt(0) || "?"}
                  </Text>
                </View>
              )}
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#000" }}
                >
                  {listing.user_name || "Unknown"}
                </Text>
                {listing.avg_rating > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    <Star color="#F59E0B" size={16} fill="#F59E0B" />
                    <Text
                      style={{ fontSize: 14, color: "#6B6B6B", marginLeft: 4 }}
                    >
                      {parseFloat(listing.avg_rating).toFixed(1)} (
                      {listing.review_count} reviews)
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "#000" }}
                >
                  Reviews ({reviews.length})
                </Text>
                {isReady &&
                  user &&
                  user.id !== listing.user_id &&
                  !showReviewForm && (
                    <TouchableOpacity onPress={() => setShowReviewForm(true)}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#10B981",
                          fontWeight: "600",
                        }}
                      >
                        Write Review
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>

              {showReviewForm && (
                <View
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#000",
                      marginBottom: 8,
                    }}
                  >
                    Your Rating
                  </Text>
                  <View
                    style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                      >
                        <Star
                          size={32}
                          color="#F59E0B"
                          fill={star <= rating ? "#F59E0B" : "transparent"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    placeholder="Share your experience..."
                    multiline
                    numberOfLines={3}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 14,
                      color: "#000",
                      marginBottom: 12,
                      textAlignVertical: "top",
                    }}
                    placeholderTextColor="#9CA3AF"
                  />
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setShowReviewForm(false)}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 8,
                        backgroundColor: "#E5E7EB",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#6B6B6B",
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSubmitReview}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 8,
                        backgroundColor: "#10B981",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#fff",
                        }}
                      >
                        Submit
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {reviews.map((review) => (
                <View
                  key={review.id}
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    {review.reviewer_image ? (
                      <Image
                        source={{ uri: review.reviewer_image }}
                        style={{ width: 32, height: 32, borderRadius: 16 }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: "#E5E7EB",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "bold",
                            color: "#6B6B6B",
                          }}
                        >
                          {review.reviewer_name?.charAt(0) || "?"}
                        </Text>
                      </View>
                    )}
                    <View style={{ marginLeft: 8, flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#000",
                        }}
                      >
                        {review.reviewer_name}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 2,
                        }}
                      >
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            color="#F59E0B"
                            fill={i < review.rating ? "#F59E0B" : "transparent"}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  {review.comment && (
                    <Text
                      style={{ fontSize: 14, color: "#374151", lineHeight: 20 }}
                    >
                      {review.comment}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Message Input */}
      {isReady && user && user.id !== listing.user_id && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: insets.bottom + 12,
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
          }}
        >
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Send a message..."
              style={{
                flex: 1,
                backgroundColor: "#F3F4F6",
                borderRadius: 24,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: "#000",
              }}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={sendingMessage || !message.trim()}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: message.trim() ? "#10B981" : "#E5E7EB",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {sendingMessage ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <MessageCircle color="#fff" size={24} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {(!isReady || !user) && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#10B981",
            paddingHorizontal: 20,
            paddingVertical: 16,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <TouchableOpacity
            onPress={() => signIn()}
            style={{
              backgroundColor: "#fff",
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: "bold", color: "#10B981" }}
            >
              Sign in to contact seller
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { ChevronLeft, Upload, X } from "lucide-react-native";
import useUser from "@/utils/auth/useUser";
import useUpload from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function CreateSeedListing() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: user } = useUser();
  const { upload, uploading } = useUpload();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    category_id: null,
    quantity: "",
    listing_type: "offer",
    exchange_type: "free",
    price: "",
    location_city: "",
    location_state: "",
    growing_season: "",
    days_to_harvest: "",
    difficulty: "Medium",
    organic: false,
    heirloom: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/seeds/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleUploadImage = async () => {
    try {
      const imageUrl = await upload();
      if (imageUrl) {
        setFormData({ ...formData, image: imageUrl });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image");
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (formData.exchange_type === "sell" && !formData.price) {
      Alert.alert("Error", "Please enter a price");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/seeds/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create listing");

      const result = await response.json();
      Alert.alert("Success", "Your seed listing has been created!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error creating listing:", error);
      Alert.alert("Error", "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior="padding"
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft color="#000" size={28} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000" }}>
            Create Listing
          </Text>
          <View style={{ width: 28 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Upload */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#000",
              marginBottom: 8,
            }}
          >
            Photo
          </Text>
          {formData.image ? (
            <View style={{ position: "relative" }}>
              <Image
                source={{ uri: formData.image }}
                style={{ width: "100%", height: 200, borderRadius: 12 }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, image: null })}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: 20,
                  width: 32,
                  height: 32,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <X color="#fff" size={20} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleUploadImage}
              disabled={uploading}
              style={{
                height: 200,
                borderRadius: 12,
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: "#D1D5DB",
                backgroundColor: "#F9FAFB",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {uploading ? (
                <ActivityIndicator size="large" color="#10B981" />
              ) : (
                <>
                  <Upload color="#6B6B6B" size={40} />
                  <Text
                    style={{ fontSize: 14, color: "#6B6B6B", marginTop: 8 }}
                  >
                    Tap to upload photo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Title */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#000",
              marginBottom: 8,
            }}
          >
            Title *
          </Text>
          <TextInput
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="e.g., Organic Tomato Seeds"
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: "#000",
            }}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Description */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#000",
              marginBottom: 8,
            }}
          >
            Description
          </Text>
          <TextInput
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            placeholder="Tell us about these seeds..."
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: "#000",
              height: 100,
              textAlignVertical: "top",
            }}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Category */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#000",
              marginBottom: 8,
            }}
          >
            Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() =>
                  setFormData({ ...formData, category_id: cat.id })
                }
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor:
                    formData.category_id === cat.id ? "#10B981" : "#F3F4F6",
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    color: formData.category_id === cat.id ? "#fff" : "#6B6B6B",
                    fontWeight: "600",
                  }}
                >
                  {cat.icon} {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Listing Type */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#000",
              marginBottom: 8,
            }}
          >
            I want to *
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() =>
                setFormData({ ...formData, listing_type: "offer" })
              }
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor:
                  formData.listing_type === "offer" ? "#10B981" : "#F3F4F6",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: formData.listing_type === "offer" ? "#fff" : "#6B6B6B",
                  fontWeight: "600",
                }}
              >
                Offer Seeds
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setFormData({ ...formData, listing_type: "request" })
              }
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor:
                  formData.listing_type === "request" ? "#10B981" : "#F3F4F6",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color:
                    formData.listing_type === "request" ? "#fff" : "#6B6B6B",
                  fontWeight: "600",
                }}
              >
                Request Seeds
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exchange Type */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#000",
              marginBottom: 8,
            }}
          >
            Exchange Type *
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() =>
                setFormData({ ...formData, exchange_type: "free" })
              }
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor:
                  formData.exchange_type === "free" ? "#10B981" : "#F3F4F6",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: formData.exchange_type === "free" ? "#fff" : "#6B6B6B",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                Free
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setFormData({ ...formData, exchange_type: "trade" })
              }
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor:
                  formData.exchange_type === "trade" ? "#10B981" : "#F3F4F6",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color:
                    formData.exchange_type === "trade" ? "#fff" : "#6B6B6B",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                Trade
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setFormData({ ...formData, exchange_type: "sell" })
              }
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor:
                  formData.exchange_type === "sell" ? "#10B981" : "#F3F4F6",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: formData.exchange_type === "sell" ? "#fff" : "#6B6B6B",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                Sell
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price (if selling) */}
        {formData.exchange_type === "sell" && (
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#000",
                marginBottom: 8,
              }}
            >
              Price *
            </Text>
            <TextInput
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              placeholder="0.00"
              keyboardType="decimal-pad"
              style={{
                backgroundColor: "#F3F4F6",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: "#000",
              }}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {/* Quantity */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#000",
              marginBottom: 8,
            }}
          >
            Quantity
          </Text>
          <TextInput
            value={formData.quantity}
            onChangeText={(text) =>
              setFormData({ ...formData, quantity: text })
            }
            placeholder="e.g., 50 seeds, 1 packet"
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: "#000",
            }}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Location */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#000",
              marginBottom: 8,
            }}
          >
            Location
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TextInput
              value={formData.location_city}
              onChangeText={(text) =>
                setFormData({ ...formData, location_city: text })
              }
              placeholder="City"
              style={{
                flex: 1,
                backgroundColor: "#F3F4F6",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: "#000",
              }}
              placeholderTextColor="#9CA3AF"
            />
            <TextInput
              value={formData.location_state}
              onChangeText={(text) =>
                setFormData({ ...formData, location_state: text })
              }
              placeholder="State"
              style={{
                flex: 1,
                backgroundColor: "#F3F4F6",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: "#000",
              }}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Growing Info */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#000",
              marginBottom: 8,
            }}
          >
            Growing Season
          </Text>
          <TextInput
            value={formData.growing_season}
            onChangeText={(text) =>
              setFormData({ ...formData, growing_season: text })
            }
            placeholder="e.g., Spring, Summer"
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: "#000",
            }}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#000",
              marginBottom: 8,
            }}
          >
            Days to Harvest
          </Text>
          <TextInput
            value={formData.days_to_harvest}
            onChangeText={(text) =>
              setFormData({ ...formData, days_to_harvest: text })
            }
            placeholder="e.g., 60-80 days"
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: "#000",
            }}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Difficulty */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#000",
              marginBottom: 8,
            }}
          >
            Growing Difficulty
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {["Easy", "Medium", "Hard"].map((diff) => (
              <TouchableOpacity
                key={diff}
                onPress={() => setFormData({ ...formData, difficulty: diff })}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor:
                    formData.difficulty === diff ? "#10B981" : "#F3F4F6",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: formData.difficulty === diff ? "#fff" : "#6B6B6B",
                    fontWeight: "600",
                  }}
                >
                  {diff}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Organic & Heirloom */}
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() =>
              setFormData({ ...formData, organic: !formData.organic })
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: formData.organic ? "#10B981" : "#D1D5DB",
                backgroundColor: formData.organic ? "#10B981" : "#fff",
                marginRight: 12,
              }}
            />
            <Text style={{ fontSize: 16, color: "#000" }}>🌿 Organic</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setFormData({ ...formData, heirloom: !formData.heirloom })
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: formData.heirloom ? "#10B981" : "#D1D5DB",
                backgroundColor: formData.heirloom ? "#10B981" : "#fff",
                marginRight: 12,
              }}
            />
            <Text style={{ fontSize: 16, color: "#000" }}>👑 Heirloom</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        }}
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: "#10B981",
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
              Create Listing
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}

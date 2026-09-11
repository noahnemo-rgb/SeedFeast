import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Plus, Search, MapPin, Filter } from "lucide-react-native";
import useUser from "@/utils/auth/useUser";
import { useAuth } from "@/utils/auth/useAuth";

export default function SeedsHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: user, loading: userLoading } = useUser();
  const { signIn, isReady } = useAuth();
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchListings();
  }, [selectedCategory, selectedType]);

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

  const fetchListings = async () => {
    try {
      setLoading(true);
      let url = "/api/seeds/listings?";
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (selectedType !== "all") url += `type=${selectedType}&`;
      if (searchQuery) url += `search=${searchQuery}&`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch listings");
      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchListings();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View>
            <Text style={{ fontSize: 32, fontWeight: "bold", color: "#000" }}>
              Seed Share
            </Text>
            <Text style={{ fontSize: 16, color: "#6B6B6B", marginTop: 4 }}>
              Grow your garden together 🌱
            </Text>
          </View>
          {isReady && user && (
            <TouchableOpacity
              onPress={() => router.push("/create-seed-listing")}
              style={{
                backgroundColor: "#10B981",
                width: 48,
                height: 48,
                borderRadius: 24,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Plus color="#fff" size={24} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F3F4F6",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 16,
          }}
        >
          <Search color="#6B6B6B" size={20} />
          <TextInput
            placeholder="Search seeds..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: "#000",
            }}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Type Filter */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setSelectedType("all")}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: selectedType === "all" ? "#10B981" : "#F3F4F6",
            }}
          >
            <Text
              style={{
                color: selectedType === "all" ? "#fff" : "#6B6B6B",
                fontWeight: "600",
              }}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedType("offer")}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: selectedType === "offer" ? "#10B981" : "#F3F4F6",
            }}
          >
            <Text
              style={{
                color: selectedType === "offer" ? "#fff" : "#6B6B6B",
                fontWeight: "600",
              }}
            >
              Offers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedType("request")}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor:
                selectedType === "request" ? "#10B981" : "#F3F4F6",
            }}
          >
            <Text
              style={{
                color: selectedType === "request" ? "#fff" : "#6B6B6B",
                fontWeight: "600",
              }}
            >
              Requests
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 8 }}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor:
                selectedCategory === null ? "#10B981" : "#F3F4F6",
              marginRight: 8,
            }}
          >
            <Text
              style={{
                color: selectedCategory === null ? "#fff" : "#6B6B6B",
                fontWeight: "600",
              }}
            >
              All Categories
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  selectedCategory === cat.id ? "#10B981" : "#F3F4F6",
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: selectedCategory === cat.id ? "#fff" : "#6B6B6B",
                  fontWeight: "600",
                }}
              >
                {cat.icon} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Listings */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#10B981"
            style={{ marginTop: 40 }}
          />
        ) : listings.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text
              style={{ fontSize: 18, color: "#6B6B6B", textAlign: "center" }}
            >
              No seed listings found.{"\n"}Be the first to share!
            </Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {listings.map((listing) => (
              <TouchableOpacity
                key={listing.id}
                onPress={() => router.push(`/seed/${listing.id}`)}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
              >
                {listing.image && (
                  <Image
                    source={{ uri: listing.image }}
                    style={{ width: "100%", height: 200 }}
                    resizeMode="cover"
                  />
                )}
                <View style={{ padding: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "#000",
                          marginBottom: 4,
                        }}
                      >
                        {listing.title}
                      </Text>
                      {listing.category_name && (
                        <Text style={{ fontSize: 14, color: "#6B6B6B" }}>
                          {listing.category_icon} {listing.category_name}
                        </Text>
                      )}
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                        backgroundColor:
                          listing.listing_type === "offer"
                            ? "#ECFDF5"
                            : "#FEF3C7",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color:
                            listing.listing_type === "offer"
                              ? "#059669"
                              : "#D97706",
                        }}
                      >
                        {listing.listing_type === "offer"
                          ? "Offering"
                          : "Requesting"}
                      </Text>
                    </View>
                  </View>

                  {listing.description && (
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#6B6B6B",
                        marginBottom: 12,
                      }}
                      numberOfLines={2}
                    >
                      {listing.description}
                    </Text>
                  )}

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      {listing.exchange_type === "free" && (
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            backgroundColor: "#ECFDF5",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#059669",
                              fontWeight: "600",
                            }}
                          >
                            FREE
                          </Text>
                        </View>
                      )}
                      {listing.exchange_type === "trade" && (
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            backgroundColor: "#EFF6FF",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#2563EB",
                              fontWeight: "600",
                            }}
                          >
                            TRADE
                          </Text>
                        </View>
                      )}
                      {listing.exchange_type === "sell" && listing.price && (
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "#10B981",
                          }}
                        >
                          ${parseFloat(listing.price).toFixed(2)}
                        </Text>
                      )}
                      {listing.organic && (
                        <Text style={{ fontSize: 12, color: "#059669" }}>
                          🌿 Organic
                        </Text>
                      )}
                      {listing.heirloom && (
                        <Text style={{ fontSize: 12, color: "#8B5CF6" }}>
                          👑 Heirloom
                        </Text>
                      )}
                    </View>
                    {listing.location_city && (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <MapPin color="#6B6B6B" size={14} />
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#6B6B6B",
                            marginLeft: 4,
                          }}
                        >
                          {listing.location_city}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 12,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: "#F3F4F6",
                    }}
                  >
                    {listing.user_image ? (
                      <Image
                        source={{ uri: listing.user_image }}
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
                          {listing.user_name?.charAt(0) || "?"}
                        </Text>
                      </View>
                    )}
                    <Text
                      style={{ fontSize: 14, color: "#6B6B6B", marginLeft: 8 }}
                    >
                      {listing.user_name || "Unknown"}
                    </Text>
                    {listing.avg_rating > 0 && (
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#F59E0B",
                          marginLeft: "auto",
                        }}
                      >
                        ⭐ {parseFloat(listing.avg_rating).toFixed(1)} (
                        {listing.review_count})
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {!isReady || !user ? (
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
              Sign in to share seeds
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

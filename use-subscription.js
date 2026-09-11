import { useCallback, useEffect } from "react";
import { create } from "zustand";

const useSubscriptionStore = create((set, get) => ({
  status: null,
  loading: true,
  setStatus: (status) => set({ status }),
  setLoading: (loading) => set({ loading }),
  checkSubscription: async () => {
    if (get().loading === false) {
      return;
    }
    try {
      const response = await fetch("/api/get-subscription-status", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to check subscription status");
      }
      const data = await response.json();
      const isActive = data.status === "active";
      set({ status: isActive, loading: false });
    } catch (error) {
      console.error("Error checking subscription:", error);
      set({ loading: false });
    }
  },
  refetchSubscription: async () => {
    set({ loading: true });
    try {
      const response = await fetch("/api/get-subscription-status", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to check subscription status");
      }
      const data = await response.json();
      const isActive = data.status === "active";
      set({ status: isActive, loading: false });
    } catch (error) {
      console.error("Error refetching subscription:", error);
      set({ loading: false });
    }
  },
}));

export function useSubscription() {
  const { status, loading, checkSubscription, refetchSubscription } =
    useSubscriptionStore();

  const initiateSubscription = useCallback(
    async (product = "premium") => {
      try {
        const response = await fetch("/api/stripe-checkout-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            redirectURL: window.location.href,
            product,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get checkout link");
        }

        const { url } = await response.json();
        if (url) {
          const popup = window.open(url, "_blank", "popup");
          const checkClosed = setInterval(() => {
            try {
              if (
                popup.closed ||
                popup.location.href.includes(window.location.href)
              ) {
                clearInterval(checkClosed);
                popup.close();
                refetchSubscription();
              }
            } catch (e) {}
          }, 1000);
        }
      } catch (error) {
        console.error("Error:", error);
        console.error("Could not start the upgrade process. Please try again.");
      }
    },
    [refetchSubscription],
  );

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return {
    isSubscribed: status,
    data: status,
    loading,
    initiateSubscription,
    refetchSubscription,
  };
}

export default useSubscription;

import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ 
        user_email: user.email,
        status: "active"
      });
      return subs[0] || null;
    },
    enabled: !!user?.email
  });

  const isPremium = subscription && subscription.plan !== "free";

  return (
    <SubscriptionContext.Provider value={{ subscription, isPremium, isLoading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription doit être utilisé dans SubscriptionProvider");
  }
  return context;
}
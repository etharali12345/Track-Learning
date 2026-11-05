import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { createContext, useContext, useState, type ReactNode } from "react";

type SubscriptionsContextValue = {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
};

//create a context: defines the shape of the shared data.
const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
  null,
);

//create a provider: a component that wraps the app and allows the sharing of the data, it holds the state and passes it through value.
export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState(HOME_SUBSCRIPTIONS);

  const addSubscription = (subscription: Subscription) => {
    setSubscriptions((currentSubscriptions) => [
      subscription,
      ...currentSubscriptions,
    ]);
  };

  return (
    <SubscriptionsContext.Provider value={{ subscriptions, addSubscription }}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

//a custom hook: read the provider values, and when it change it render every component using it
export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error(
      "useSubscriptions must be used within a SubscriptionsProvider",
    );
  }
  return context;
}

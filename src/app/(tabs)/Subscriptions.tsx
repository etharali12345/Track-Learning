import SubscriptionsCard from "@/components/SubscriptionsCard";
import { useSubscriptions } from "@/components/SubscriptionsContext";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StyledSafeAreaView = styled(SafeAreaView);

export default function Subscriptions() {
  const [query, setQuery] = useState("");
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const { subscriptions: allSubscriptions } = useSubscriptions();
  const normalizedQuery = query.trim().toLocaleLowerCase();

  /* 
      useMemo: caches the result of a calculation between renders, returns it, and recomputes it only when its dependencies change, for performance optimization
      It's performed during rendering, so it shouldn't be used with state, cause using state trigger rendering, causing re-rendering loop 
    */
  const subscriptions = useMemo(
    () =>
      allSubscriptions.filter((subscription) =>
        [
          subscription.name,
          subscription.plan,
          subscription.category,
          subscription.billing,
          subscription.paymentMethod,
          subscription.status,
        ].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery)),
      ),
    [allSubscriptions, normalizedQuery],
  );

  return (
    <StyledSafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        data={subscriptions}
        renderItem={({ item }) => (
          <SubscriptionsCard
            {...item}
            expanded={expandedSubId === item.id}
            onPress={() =>
              setExpandedSubId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        keyExtractor={(item) => item.id}
        extraData={expandedSubId}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="pb-20"
        ListHeaderComponent={
          <View>
            <Text className="subscription-screen-title">Subscriptions</Text>
            <View className="subscription-search">
              <TextInput
                accessibilityLabel="Search subscriptions"
                className="subscription-search-input"
                onChangeText={setQuery}
                placeholder="Search subscriptions"
                placeholderTextColor="#666666"
                returnKeyType="search"
                value={query}
              />
              {query.length > 0 && (
                <Pressable
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                  className="subscription-search-clear"
                  onPress={() => setQuery("")}
                >
                  <Text className="subscription-search-clear-text">Clear</Text>
                </Pressable>
              )}
            </View>
            <Text className="subscription-result-count">
              {subscriptions.length}{" "}
              {subscriptions.length === 1 ? "subscription" : "subscriptions"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text className="home-empty-state">
            {allSubscriptions.length === 0
              ? "No subscriptions yet"
              : "No subscriptions match your search"}
          </Text>
        }
      />
    </StyledSafeAreaView>
  );
}

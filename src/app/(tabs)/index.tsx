import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionsCard from "@/components/SubscriptionsCard";
import { useSubscriptions } from "@/components/SubscriptionsContext";
import UpcomingSubscriptionsCard from "@/components/UpcomingSubscriptionsCard";
import { posthogLogger } from "@/config/posthog-logger";
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icon";
import images from "@/constants/images";
import { useUser } from "@clerk/expo";
import { formatCurrency } from "@root/lib/utils";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//use styled because SafeAreaView is not a nativewind component, so we need to wrap it in a styled component to use nativewind classes,
const StyledSafeAreaView = styled(SafeAreaView);

export default function HomeScreen() {
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const { subscriptions, addSubscription } = useSubscriptions();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const { user } = useUser();
  const posthog = usePostHog();

  return (
    <StyledSafeAreaView
      className={clsx(
        "flex-1",
        isCreateModalVisible ? "bg-black" : "bg-background",
      )}
    >
      <FlatList
        ListHeaderComponent={
          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={images.avatar} className="home-avatar" />
                <Text className="home-user-name">
                  {user?.firstName} | {user?.lastName}{" "}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Create a subscription"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setIsCreateModalVisible(true)}
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {" "}
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View>
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionsCard {...item} />
                )}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No Upcoming renewals yet
                  </Text>
                }
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        }
        data={subscriptions}
        renderItem={({ item }) => (
          <SubscriptionsCard
            {...item}
            expanded={expandedSubId === item.id}
            onPress={() => {
              if (expandedSubId !== item.id) {
                const subscriptionProperties = {
                  subscription_id: item.id,
                  billing_interval: item.billing,
                  subscription_category: (item.category ?? item.plan)!,
                };

                posthog.capture(
                  "subscription_details_opened",
                  subscriptionProperties,
                );
                posthogLogger.info(
                  "subscription details opened",
                  subscriptionProperties,
                );
              }

              setExpandedSubId((currentId) =>
                currentId === item.id ? null : item.id,
              );
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        extraData={expandedSubId}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No Subscriptions yet</Text>
        }
        contentContainerClassName="pb-20 bg-background p-5"
      />
      <CreateSubscriptionModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreate={addSubscription}
      />
    </StyledSafeAreaView>
  );
}

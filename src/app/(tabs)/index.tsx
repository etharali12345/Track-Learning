import ListHeading from "@/components/ListHeading";
import SubscriptionsCard from "@/components/SubscriptionsCard";
import UpcomingSubscriptionsCard from "@/components/UpcomingSubscriptionsCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@root/constants/data";
import { icons } from "@root/constants/icon";
import images from "@root/constants/images";
import { formatCurrency } from "@root/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//use styled because SafeAreaView is not a nativewind component, so we need to wrap it in a styled component to use nativewind classes,
const StyledSafeAreaView = styled(SafeAreaView);

export default function index() {
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  return (
    <StyledSafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={
          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={images.avatar} className="home-avatar" />
                <Text className="home-user-name">{HOME_USER.name}</Text>
              </View>
              <Image source={icons.add} className="home-add-icon" />
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
        data={HOME_SUBSCRIPTIONS}
        renderItem={({ item }) => (
          <SubscriptionsCard
            {...item}
            expanded={expandedSubId === item.id}
            onPress={() => {
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
        contentContainerClassName="pb-20"
      />
    </StyledSafeAreaView>
  );
}

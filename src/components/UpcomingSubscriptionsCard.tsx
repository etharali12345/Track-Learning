import { formatCurrency } from "@root/lib/utils";
import { Image, Text, View } from "react-native";

export default function UpcomingSubscriptionsCard({
  name,
  price,
  daysLeft,
  icon,
  currency,
}: UpcomingSubscription) {
  return (
    <View className="upcoming-card ">
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" />
        <View className="">
          <Text className="upcoming-price">
            {formatCurrency(price, currency)}
          </Text>
          <Text className="upcoming-meta">
            {daysLeft > 1 ? "last day" : `${daysLeft} days left`}
          </Text>
        </View>
      </View>

      <Text className="upcoming-name">{name}</Text>
    </View>
  );
}

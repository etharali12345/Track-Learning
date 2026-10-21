import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@root/lib/utils";
import clsx from "clsx";
import { Image, Pressable, Text, View } from "react-native";

export default function SubscriptionsCard({
  name,
  price,
  icon,
  currency,
  billing,
  color,
  category,
  renewalDate,
  plan,
  paymentMethod,
  startDate,
  status,
  onPress,
  expanded,
}: SubscriptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={clsx(
        "sub-card",
        "bg-card",
        expanded ? "sub-card-expanded" : "bg-card",
      )}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image className="sub-icon" source={icon} />
          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {name}
            </Text>
            <Text numberOfLines={1} className="sub-meta" ellipsizeMode="tail">
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
            </Text>
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="">{formatCurrency(price, currency)}</Text>
          <Text className="">{billing}</Text>
        </View>
      </View>
      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-lable">Payment:</Text>
                <Text className="sub-value">{paymentMethod?.trim()}</Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-lable">Category:</Text>
                <Text className="sub-value">
                  {category?.trim() || plan?.trim()}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-lable">Started:</Text>
                <Text className="sub-value">
                  {startDate ? formatSubscriptionDateTime(startDate) : ""}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-lable">Renewal Date:</Text>
                <Text className="sub-value">
                  {renewalDate ? formatSubscriptionDateTime(renewalDate) : ""}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-lable">Status</Text>
                <Text className="sub-value">
                  {status ? formatStatusLabel(status) : ""}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

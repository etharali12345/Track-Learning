import { posthogLogger } from "@/config/posthog-logger";
import { icons } from "@/constants/icon";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { usePostHog } from "posthog-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

type SubscriptionCategory =
  | "Entertainment"
  | "AI Tools"
  | "Developer Tools"
  | "Design"
  | "Productivity"
  | "Cloud"
  | "Music"
  | "Other";

const categories: SubscriptionCategory[] = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
];

const categoryColors: Record<SubscriptionCategory, string> = {
  Entertainment: "#b8d4e3",
  "AI Tools": "#b8e8d0",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#d9e8fc",
  Cloud: "#ccebd8",
  Music: "#f7c7d7",
  Other: "#e7e2d5",
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("Monthly");
  const [category, setCategory] = useState<SubscriptionCategory>("Other");

  const posthog = usePostHog();

  const parsedPrice = Number(price);
  const isValid =
    name.trim().length > 0 &&
    price.trim().length > 0 &&
    Number.isFinite(parsedPrice) &&
    parsedPrice > 0;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Other");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }

    const startDate = dayjs();

    const subscription: Subscription = {
      id: `subscription-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      price: parsedPrice,
      frequency,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate: startDate
        .add(1, frequency === "Monthly" ? "month" : "year")
        .toISOString(),
      icon: icons.plus,
      billing: frequency,
      color: categoryColors[category],
    };

    onCreate(subscription);

    posthog.capture("Subscription Created", {
      subscription_id: subscription.id,
      subscription_name: name,
      subscription_price: price,
      subscription_frequency: frequency,
      subscription_category: category,
    });
    posthogLogger.info("Subscription Created", {
      subscription_id: subscription.id,
      subscription_name: name,
      subscription_price: price,
      subscription_frequency: frequency,
      subscription_category: category,
    });

    resetForm();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={handleClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="modal-overlay">
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable
                accessibilityLabel="Close new subscription form"
                accessibilityRole="button"
                className="modal-close"
                onPress={handleClose}
              >
                <Text className="modal-close-text">x</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerClassName="modal-body"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  accessibilityLabel="Name"
                  className="auth-input"
                  onChangeText={setName}
                  placeholder="e.g. Netflix"
                  placeholderTextColor="rgba(8, 17, 38, 0.45)"
                  returnKeyType="next"
                  value={name}
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  accessibilityLabel="Price"
                  className="auth-input"
                  keyboardType="decimal-pad"
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor="rgba(8, 17, 38, 0.45)"
                  value={price}
                />
                {price.length > 0 &&
                (!Number.isFinite(parsedPrice) || parsedPrice <= 0) ? (
                  <Text className="auth-error">
                    Enter a price greater than 0.
                  </Text>
                ) : null}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  {(["Monthly", "Yearly"] as const).map((option) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: frequency === option }}
                      className={clsx(
                        "picker-option",
                        frequency === option && "picker-option-active",
                      )}
                      key={option}
                      onPress={() => setFrequency(option)}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === option && "picker-option-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {categories.map((option) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: category === option }}
                      className={clsx(
                        "category-chip",
                        category === option && "category-chip-active",
                      )}
                      key={option}
                      onPress={() => setCategory(option)}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          category === option && "category-chip-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {name.length > 0 && !name.trim() ? (
                <Text className="auth-error">Enter a subscription name.</Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !isValid }}
                className={clsx(
                  "auth-button",
                  !isValid && "auth-button-disabled",
                )}
                disabled={!isValid}
                onPress={handleSubmit}
              >
                <Text className="auth-button-text">Create Subscription</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

import { Link } from "expo-router";
import { styled } from "nativewind";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StyledSafeAreaView = styled(SafeAreaView);

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthScreen({ title, subtitle, children }: AuthScreenProps) {
  return (
    <StyledSafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">T</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Track</Text>
                <Text className="auth-wordmark-sub">Subscription manager</Text>
              </View>
            </View>
            <Text className="auth-title">{title}</Text>
            <Text className="auth-subtitle">{subtitle}</Text>
          </View>

          <View className="auth-card">{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}

type AuthFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
} & Pick<
  TextInputProps,
  | "autoCapitalize"
  | "autoComplete"
  | "keyboardType"
  | "onSubmitEditing"
  | "placeholder"
  | "returnKeyType"
  | "secureTextEntry"
  | "textContentType"
>;

export function AuthField({
  label,
  value,
  onChangeText,
  error,
  ...inputProps
}: AuthFieldProps) {
  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        accessibilityHint={error}
        className={`auth-input${error ? " auth-input-error" : ""}`}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="rgba(8, 17, 38, 0.45)"
        selectionColor="#ea7a53"
      />
      {error ? <Text className="auth-error">{error}</Text> : null}
    </View>
  );
}

type AuthActionButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
};

export function AuthActionButton({
  label,
  onPress,
  loading = false,
}: AuthActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: loading, busy: loading }}
      className={`auth-button${loading ? " auth-button-disabled" : ""}`}
      disabled={loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color="#081126" />
      ) : (
        <Text className="auth-button-text">{label}</Text>
      )}
    </Pressable>
  );
}

type AuthInlineLinkProps = {
  label: string;
  onPress?: () => void;
  href?: "/SignIn" | "/SignUp";
  disabled?: boolean;
};

export function AuthInlineLink({
  label,
  onPress,
  href,
  disabled = false,
}: AuthInlineLinkProps) {
  const className = `auth-link${disabled ? " opacity-40" : ""}`;

  if (href) {
    return (
      <Link href={href} asChild>
        <Pressable accessibilityRole="link" disabled={disabled}>
          <Text className={className}>{label}</Text>
        </Pressable>
      </Link>
    );
  }

  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}>
      <Text className={className}>{label}</Text>
    </Pressable>
  );
}

type AuthTextProps = {
  children: ReactNode;
  className?: string;
};

export function AuthText({ children, className }: AuthTextProps) {
  return <Text className={className}>{children}</Text>;
}

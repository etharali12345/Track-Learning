import {
  AuthActionButton,
  AuthField,
  AuthInlineLink,
  AuthScreen,
  AuthText,
} from "@/components/auth/AuthScreen";
import { posthogLogger } from "@/config/posthog-logger";
import { useAuth, useSignUp } from "@clerk/expo";
import { usePostHog } from "posthog-react-native";
import { useEffect, useState } from "react";
import { Keyboard, View } from "react-native";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const { isLoaded: authLoaded } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();
  const posthog = usePostHog();
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [validation, setValidation] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const isBusy = isSubmitting || fetchStatus === "fetching";

  useEffect(() => {
    if (resendSeconds === 0) return;
    const timeout = setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timeout);
  }, [resendSeconds]);

  const clearError = (field: string) => {
    setValidation((current) => ({ ...current, [field]: "" }));
    setRequestError("");
  };

  const setFailure = (error: { longMessage?: string } | null, fallback: string) => {
    setRequestError(error?.longMessage || fallback);
  };

  const startVerification = async () => {
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) {
      setFailure(error, "We couldn't send a verification code. Please try again.");
      return false;
    }

    setIsVerifying(true);
    setCode("");
    setResendSeconds(30);
    return true;
  };

  const submitSignUp = async () => {
    Keyboard.dismiss();
    setRequestError("");
    const normalizedEmail = email.trim();
    const nextValidation: Record<string, string> = {};

    if (!emailPattern.test(normalizedEmail)) {
      nextValidation.email = "Enter a valid email address.";
    }
    if (password.length < 8) {
      nextValidation.password = "Use at least 8 characters.";
    }
    if (confirmPassword !== password) {
      nextValidation.confirmPassword = "Your passwords don't match.";
    }

    setValidation(nextValidation);
    if (Object.keys(nextValidation).length > 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await signUp.password({
        emailAddress: normalizedEmail,
        password,
      });
      if (error) {
        setFailure(error, "We couldn't create your account. Please check your details.");
        return;
      }

      await startVerification();
    } catch {
      setRequestError("We couldn't connect securely. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyEmail = async () => {
    Keyboard.dismiss();
    setRequestError("");
    const normalizedCode = code.trim();
    if (!normalizedCode) {
      setValidation((current) => ({ ...current, code: "Enter the verification code." }));
      return;
    }

    setValidation((current) => ({ ...current, code: "" }));
    setIsSubmitting(true);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: normalizedCode,
      });
      if (error) {
        setFailure(error, "That code couldn't be verified. Check it and try again.");
        return;
      }

      if (signUp.status !== "complete") {
        setRequestError("Your account needs another step before it can be activated.");
        return;
      }

      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        setFailure(finalizeError, "We couldn't finish creating your account. Please try again.");
        return;
      }

      posthog.capture("account_created");
      posthogLogger.info("account created after email verification");
    } catch {
      setRequestError("We couldn't connect securely. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    setRequestError("");
    setIsSubmitting(true);
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        setFailure(error, "We couldn't send a new code. Please try again.");
        return;
      }

      setResendSeconds(30);
      setCode("");
    } catch {
      setRequestError("We couldn't connect securely. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeEmail = async () => {
    setRequestError("");
    setIsSubmitting(true);
    try {
      const { error } = await signUp.reset();
      if (error) {
        setFailure(error, "We couldn't restart sign up. Please try again.");
        return;
      }

      setIsVerifying(false);
      setCode("");
      setPassword("");
      setConfirmPassword("");
      setValidation({});
      setResendSeconds(0);
    } catch {
      setRequestError("We couldn't restart sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authLoaded) return null;

  return (
    <AuthScreen
      title={isVerifying ? "Check your inbox" : "Create your account"}
      subtitle={
        isVerifying
          ? `Enter the verification code sent to ${email.trim()}.`
          : "Start bringing your subscriptions into focus."
      }
    >
      {requestError || errors.global?.[0]?.longMessage ? (
        <View className="auth-message" accessibilityRole="alert">
          <AuthText className="auth-message-text">
            {requestError || errors.global?.[0]?.longMessage}
          </AuthText>
        </View>
      ) : null}

      {isVerifying ? (
        <>
          <AuthField
            label="Verification code"
            value={code}
            onChangeText={(value) => {
              setCode(value);
              clearError("code");
            }}
            placeholder="Enter the code from your email"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            error={validation.code || errors.fields.code?.message}
            returnKeyType="go"
            onSubmitEditing={() => void verifyEmail()}
          />
          <AuthActionButton
            label="Verify email"
            loading={isBusy}
            onPress={() => void verifyEmail()}
          />
          <View className="auth-link-row">
            <AuthText className="auth-link-copy">
              {resendSeconds > 0
                ? `Resend available in ${resendSeconds}s`
                : "Didn't get the email?"}
            </AuthText>
            {resendSeconds === 0 ? (
              <AuthInlineLink
                label="Resend code"
                onPress={() => void resendCode()}
                disabled={isBusy}
              />
            ) : null}
          </View>
          <View className="auth-link-row">
            <AuthInlineLink
              label="Use a different email"
              onPress={() => void changeEmail()}
              disabled={isBusy}
            />
          </View>
        </>
      ) : (
        <>
          <AuthField
            label="Email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              clearError("email");
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            autoCapitalize="none"
            error={
              validation.email ||
              errors.fields.emailAddress?.message
            }
            returnKeyType="next"
          />
          <AuthField
            label="Password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              clearError("password");
            }}
            placeholder="At least 8 characters"
            textContentType="newPassword"
            autoComplete="new-password"
            secureTextEntry
            error={validation.password || errors.fields.password?.message}
            returnKeyType="next"
          />
          <AuthField
            label="Confirm password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              clearError("confirmPassword");
            }}
            placeholder="Re-enter your password"
            textContentType="newPassword"
            autoComplete="new-password"
            secureTextEntry
            error={validation.confirmPassword}
            returnKeyType="go"
            onSubmitEditing={() => void submitSignUp()}
          />
          <AuthText className="auth-helper">
            By creating an account, you agree to receive a verification email to protect your account.
          </AuthText>
          <AuthActionButton
            label="Create account"
            loading={isBusy}
            onPress={() => void submitSignUp()}
          />
          <View className="auth-link-row">
            <AuthText className="auth-link-copy">Already have an account?</AuthText>
            <AuthInlineLink label="Sign in" href="/SignIn" />
          </View>
        </>
      )}

      <View className="auth-trust-row">
        <AuthText className="auth-trust-copy">
          Your account details stay private and secure.
        </AuthText>
      </View>
    </AuthScreen>
  );
}

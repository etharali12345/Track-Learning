import {
  AuthActionButton,
  AuthField,
  AuthInlineLink,
  AuthScreen,
  AuthText,
} from "@/components/auth/AuthScreen";
import { useAuth, useSignIn } from "@clerk/expo";
import { useEffect, useState } from "react";
import { Keyboard, View } from "react-native";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const challengeMethods: ChallengeMethod[] = [
  "email_code",
  "phone_code",
  "totp",
  "backup_code",
];

/* 
  The part after the parentheses and : is the return type:
  So "strategy is ChallengeMethod" means the function return a boolean. It's just carries an extra information for TS at the compile time. If it return true, it knows that strategy is a ChallengeMethod, and treat it like that for the rest of the code 
  "some" is built-it in array method return true if one item makes your callback 
*/
function isChallengeMethod(strategy: string): strategy is ChallengeMethod {
  return challengeMethods.some((method) => method === strategy);
}

export default function SignIn() {
  //{ originalName: newName } destructure with renaming
  const { isLoaded: authLoaded } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  //type goes in angle brackets (a generic)
  const [view, setView] = useState<SignInView>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [challengeMethod, setChallengeMethod] =
    useState<ChallengeMethod>("email_code");
  const [validation, setValidation] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetResendSeconds, setResetResendSeconds] = useState(0);
  const isBusy = isSubmitting || fetchStatus === "fetching";

  useEffect(() => {
    if (resetResendSeconds === 0) return;
    const timeout = setTimeout(
      () => setResetResendSeconds((seconds) => seconds - 1),
      1000,
    );
    return () => clearTimeout(timeout);
  }, [resetResendSeconds]);

  const clearError = (field: string) => {
    setValidation((current) => ({ ...current, [field]: "" }));
    setRequestError("");
  };

  const setFailure = (
    error: { longMessage?: string } | null,
    fallback: string,
  ) => {
    setRequestError(error?.longMessage || fallback);
  };

  const finalizeSignIn = async () => {
    const { error } = await signIn.finalize();
    if (error) {
      setFailure(error, "We couldn't complete sign in. Please try again.");
    }
  };

  const chooseChallenge = async (method: ChallengeMethod) => {
    setRequestError("");
    setCode("");

    try {
      if (method === "email_code") {
        const { error } = await signIn.mfa.sendEmailCode();
        if (error) {
          setFailure(
            error,
            "We couldn't send a verification code. Please try again.",
          );
          return;
        }
      } else if (method === "phone_code") {
        const { error } = await signIn.mfa.sendPhoneCode();
        if (error) {
          setFailure(
            error,
            "We couldn't send a verification code. Please try again.",
          );
          return;
        }
      }

      setChallengeMethod(method);
      setView("mfa");
    } catch {
      setRequestError(
        "We couldn't send a verification code. Check your connection and try again.",
      );
    }
  };

  const startChallenge = async () => {
    const factors = signIn.supportedSecondFactors;
    const emailFactor = factors.some(
      (factor) => factor.strategy === "email_code",
    );
    const phoneFactor = factors.some(
      (factor) => factor.strategy === "phone_code",
    );
    const totpFactor = factors.some((factor) => factor.strategy === "totp");
    const backupFactor = factors.some(
      (factor) => factor.strategy === "backup_code",
    );

    if (emailFactor) {
      await chooseChallenge("email_code");
    } else if (phoneFactor) {
      await chooseChallenge("phone_code");
    } else if (totpFactor) {
      await chooseChallenge("totp");
    } else if (backupFactor) {
      await chooseChallenge("backup_code");
    } else {
      setRequestError(
        "This account needs another verification method. Contact support for help signing in.",
      );
    }
  };

  const submitCredentials = async () => {
    Keyboard.dismiss();
    setRequestError("");
    const nextValidation: Record<string, string> = {};
    const normalizedEmail = email.trim();

    if (!emailPattern.test(normalizedEmail)) {
      nextValidation.email = "Enter a valid email address.";
    }
    if (!password) {
      nextValidation.password = "Enter your password.";
    }

    setValidation(nextValidation);
    if (Object.keys(nextValidation).length > 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await signIn.password({
        emailAddress: normalizedEmail,
        password,
      });

      if (error) {
        setFailure(
          error,
          "We couldn't sign you in. Check your details and try again.",
        );
      } else if (signIn.status === "complete") {
        await finalizeSignIn();
      } else if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        await startChallenge();
      } else if (signIn.status === "needs_new_password") {
        setView("reset-password");
      } else if (signIn.status === "needs_protect_check") {
        setRequestError(
          "An additional security check is required. Please try again or contact support.",
        );
      } else {
        setRequestError("We couldn't complete sign in. Please try again.");
      }
    } catch {
      setRequestError(
        "We couldn't connect securely. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitChallenge = async () => {
    Keyboard.dismiss();
    setRequestError("");
    const normalizedCode = code.trim();
    if (!normalizedCode) {
      setValidation((current) => ({
        ...current,
        code: "Enter the verification code.",
      }));
      return;
    }

    setValidation((current) => ({ ...current, code: "" }));
    setIsSubmitting(true);
    try {
      let error: { longMessage?: string } | null = null;
      if (challengeMethod === "email_code") {
        ({ error } = await signIn.mfa.verifyEmailCode({
          code: normalizedCode,
        }));
      } else if (challengeMethod === "phone_code") {
        ({ error } = await signIn.mfa.verifyPhoneCode({
          code: normalizedCode,
        }));
      } else if (challengeMethod === "totp") {
        ({ error } = await signIn.mfa.verifyTOTP({ code: normalizedCode }));
      } else {
        ({ error } = await signIn.mfa.verifyBackupCode({
          code: normalizedCode,
        }));
      }

      if (error) {
        setFailure(
          error,
          "That code couldn't be verified. Check it and try again.",
        );
      } else if (signIn.status === "complete") {
        await finalizeSignIn();
      } else {
        setRequestError("We couldn't complete verification. Please try again.");
      }
    } catch {
      setRequestError(
        "We couldn't connect securely. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const startPasswordReset = async () => {
    Keyboard.dismiss();
    setRequestError("");
    const normalizedEmail = email.trim();
    if (!emailPattern.test(normalizedEmail)) {
      setValidation((current) => ({
        ...current,
        email: "Enter a valid email address to reset your password.",
      }));
      return;
    }

    setValidation((current) => ({ ...current, email: "" }));
    setIsSubmitting(true);
    try {
      const { error: createError } = await signIn.create({
        identifier: normalizedEmail,
      });
      if (createError) {
        setFailure(
          createError,
          "We couldn't start password recovery. Please try again.",
        );
        return;
      }

      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) {
        setFailure(error, "We couldn't send a reset code. Please try again.");
        return;
      }

      setCode("");
      setResetResendSeconds(30);
      setView("reset-code");
    } catch {
      setRequestError(
        "We couldn't connect securely. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyResetCode = async () => {
    Keyboard.dismiss();
    setRequestError("");
    const normalizedCode = code.trim();
    if (!normalizedCode) {
      setValidation((current) => ({
        ...current,
        code: "Enter the reset code.",
      }));
      return;
    }

    setValidation((current) => ({ ...current, code: "" }));
    setIsSubmitting(true);
    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
        code: normalizedCode,
      });
      if (error) {
        setFailure(
          error,
          "That reset code couldn't be verified. Check it and try again.",
        );
        return;
      }

      setView("reset-password");
    } catch {
      setRequestError(
        "We couldn't connect securely. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitNewPassword = async () => {
    Keyboard.dismiss();
    setRequestError("");
    const nextValidation: Record<string, string> = {};
    if (newPassword.length < 8) {
      nextValidation.newPassword = "Use at least 8 characters.";
    }
    if (confirmPassword !== newPassword) {
      nextValidation.confirmPassword = "Your passwords don't match.";
    }

    setValidation(nextValidation);
    if (Object.keys(nextValidation).length > 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
        signOutOfOtherSessions: true,
      });
      if (error) {
        setFailure(
          error,
          "We couldn't update your password. Please try again.",
        );
      } else if (signIn.status === "complete") {
        await finalizeSignIn();
      } else {
        setRequestError(
          "We couldn't complete your password reset. Please try again.",
        );
      }
    } catch {
      setRequestError(
        "We couldn't connect securely. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendResetCode = async () => {
    setRequestError("");
    setIsSubmitting(true);
    try {
      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) {
        setFailure(
          error,
          "We couldn't send a new reset code. Please try again.",
        );
        return;
      }

      setCode("");
      setResetResendSeconds(30);
    } catch {
      setRequestError(
        "We couldn't connect securely. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToCredentials = () => {
    setView("credentials");
    setCode("");
    setResetResendSeconds(0);
    setRequestError("");
    setValidation({});
  };

  if (!authLoaded) return null;

  const title =
    view === "credentials"
      ? "Welcome back"
      : view === "mfa"
        ? "Verify it's you"
        : view === "reset-email"
          ? "Reset your password"
          : view === "reset-code"
            ? "Check your inbox"
            : "Create a new password";
  const subtitle =
    view === "credentials"
      ? "Sign in to stay on top of your subscriptions."
      : view === "mfa"
        ? "Complete this quick security check to continue."
        : view === "reset-email"
          ? "We'll email you a secure code to reset your password."
          : view === "reset-code"
            ? `Enter the code sent to ${email.trim()}.`
            : "Choose a strong password you haven't used before.";

  console.log("view", view);

  return (
    <AuthScreen title={title} subtitle={subtitle}>
      {requestError || errors.global?.[0]?.longMessage ? (
        <View className="auth-message" accessibilityRole="alert">
          <AuthText className="auth-message-text">
            {requestError || errors.global?.[0]?.longMessage}
          </AuthText>
        </View>
      ) : null}

      {view === "credentials" || view === "reset-email" ? (
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
            error={validation.email || errors.fields.identifier?.message}
            returnKeyType="next"
          />
          {view === "credentials" ? (
            <>
              <AuthField
                label="Password"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  clearError("password");
                }}
                placeholder="Enter your password"
                textContentType="password"
                autoComplete="current-password"
                secureTextEntry
                error={validation.password || errors.fields.password?.message}
                returnKeyType="go"
                onSubmitEditing={() => void submitCredentials()}
              />
              <View className="items-end">
                <AuthInlineLink
                  label="Forgot password?"
                  onPress={() => {
                    setRequestError("");
                    setView("reset-email");
                  }}
                />
              </View>
              <AuthActionButton
                label="Sign in"
                loading={isBusy}
                onPress={() => void submitCredentials()}
              />
              <View className="auth-link-row">
                <AuthText className="auth-link-copy">New to Track?</AuthText>
                <AuthInlineLink label="Create an account" href="/SignUp" />
              </View>
            </>
          ) : (
            <>
              <AuthActionButton
                label="Send reset code"
                loading={isBusy}
                onPress={() => void startPasswordReset()}
              />
              <View className="auth-link-row">
                <AuthText className="auth-link-copy">
                  Remembered your password?
                </AuthText>
                <AuthInlineLink label="Sign in" onPress={backToCredentials} />
              </View>
            </>
          )}
        </>
      ) : null}

      {view === "mfa" ? (
        <>
          <AuthField
            label={
              challengeMethod === "totp"
                ? "Authenticator code"
                : challengeMethod === "backup_code"
                  ? "Backup code"
                  : "Verification code"
            }
            value={code}
            onChangeText={(value) => {
              setCode(value);
              clearError("code");
            }}
            placeholder={
              challengeMethod === "backup_code"
                ? "Enter a backup code"
                : "Enter your code"
            }
            keyboardType={
              challengeMethod === "backup_code" ? "default" : "number-pad"
            }
            autoCapitalize={
              challengeMethod === "backup_code" ? "characters" : "none"
            }
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            error={validation.code || errors.fields.code?.message}
            returnKeyType="go"
            onSubmitEditing={() => void submitChallenge()}
          />
          <AuthActionButton
            label="Verify and continue"
            loading={isBusy}
            onPress={() => void submitChallenge()}
          />
          {signIn.supportedSecondFactors
            .filter(
              (
                factor,
              ): factor is typeof factor & { strategy: ChallengeMethod } =>
                isChallengeMethod(factor.strategy) &&
                factor.strategy !== challengeMethod,
            )
            .map((factor) => (
              <AuthInlineLink
                key={factor.strategy}
                label={
                  factor.strategy === "email_code"
                    ? "Use an email code instead"
                    : factor.strategy === "phone_code"
                      ? "Use a text message instead"
                      : factor.strategy === "totp"
                        ? "Use an authenticator app instead"
                        : "Use a backup code instead"
                }
                onPress={() => void chooseChallenge(factor.strategy)}
              />
            ))}
          {challengeMethod === "email_code" ||
          challengeMethod === "phone_code" ? (
            <View className="auth-link-row">
              <AuthInlineLink
                label="Resend code"
                onPress={() => void chooseChallenge(challengeMethod)}
                disabled={isBusy}
              />
            </View>
          ) : null}
          <View className="auth-link-row">
            <AuthInlineLink
              label="Back to sign in"
              onPress={backToCredentials}
            />
          </View>
        </>
      ) : null}

      {view === "reset-code" ? (
        <>
          <AuthField
            label="Reset code"
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
            onSubmitEditing={() => void verifyResetCode()}
          />
          <AuthActionButton
            label="Verify code"
            loading={isBusy}
            onPress={() => void verifyResetCode()}
          />
          <View className="auth-link-row">
            <AuthText className="auth-link-copy">
              {resetResendSeconds > 0
                ? `Resend available in ${resetResendSeconds}s`
                : "Didn't get the email?"}
            </AuthText>
            {resetResendSeconds === 0 ? (
              <AuthInlineLink
                label="Resend code"
                onPress={() => void resendResetCode()}
                disabled={isBusy}
              />
            ) : null}
          </View>
          <View className="auth-link-row">
            <AuthInlineLink
              label="Use a different email"
              onPress={backToCredentials}
            />
          </View>
        </>
      ) : null}

      {view === "reset-password" ? (
        <>
          <AuthField
            label="New password"
            value={newPassword}
            onChangeText={(value) => {
              setNewPassword(value);
              clearError("newPassword");
            }}
            placeholder="At least 8 characters"
            textContentType="newPassword"
            autoComplete="new-password"
            secureTextEntry
            error={validation.newPassword || errors.fields.password?.message}
            returnKeyType="next"
          />
          <AuthField
            label="Confirm new password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              clearError("confirmPassword");
            }}
            placeholder="Re-enter your new password"
            textContentType="newPassword"
            autoComplete="new-password"
            secureTextEntry
            error={validation.confirmPassword}
            returnKeyType="go"
            onSubmitEditing={() => void submitNewPassword()}
          />
          <AuthActionButton
            label="Save new password"
            loading={isBusy}
            onPress={() => void submitNewPassword()}
          />
          <View className="auth-link-row">
            <AuthInlineLink
              label="Back to sign in"
              onPress={backToCredentials}
            />
          </View>
        </>
      ) : null}

      <View className="auth-trust-row">
        <AuthText className="auth-trust-copy">
          Your account details stay private and secure.
        </AuthText>
      </View>
    </AuthScreen>
  );
}

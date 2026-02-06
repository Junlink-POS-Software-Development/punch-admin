"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Metadata expected by the handle_new_user() PostgreSQL trigger.
 */
export interface AuthUserMetadata {
  role: "admin" | "member";
  business_name?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

/**
 * Interface for Google OAuth options, including custom metadata.
 */
interface GoogleSignInOptions {
  redirectTo?: string;
  scopes?: string;
  queryParams?: { [key: string]: string };
  skipBrowserRedirect?: boolean;
  data?: AuthUserMetadata;
}

export function useAuth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberDenied, setMemberDenied] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "member_access_denied") {
      setMemberDenied(true);
      window.history.replaceState({}, "", "/login");
    }
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
            data: {
              role: "admin",
              business_name: "My First Store",
            } as AuthUserMetadata,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        setError("Check your email to confirm your account");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // 1. redirectTo uses window.location.origin, which is perfect for
          // switching between localhost:3000 and your Vercel URL automatically.
          redirectTo: `${window.location.origin}/api/auth/callback`,

          // 2. This passes the metadata your PostgreSQL function needs
          data: {
            role: "admin",
            business_name: "Admin Dashboard",
          } as AuthUserMetadata,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        } as GoogleSignInOptions,
      });
      if (error) setError(error.message);
    } catch {
      setError("Failed to sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === "login" ? "signup" : "login");
    setError(null);
  };

  return {
    mode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    loading,
    googleLoading,
    error,
    memberDenied,
    handleAuth,
    handleGoogleLogin,
    toggleMode,
  };
}

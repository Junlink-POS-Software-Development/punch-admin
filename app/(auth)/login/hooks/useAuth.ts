"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export interface AuthUserMetadata {
  role: "admin" | "member";
  business_name?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
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
            // Passing the role here for email signups
            emailRedirectTo: `${window.location.origin}/api/auth/callback?role=admin`,
            data: { role: "admin" } as AuthUserMetadata,
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
      // Determine role based on the current context or force 'admin' for this specific portal
      const targetRole = "admin"; 

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // KEY CHANGE: Append the role to the callback URL
          redirectTo: `${window.location.origin}/api/auth/callback?role=${targetRole}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) setError(error.message);
    } catch {
      setError("Failed to sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => (prev === "login" ? "signup" : "login"));
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
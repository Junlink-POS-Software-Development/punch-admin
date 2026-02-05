"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldX } from "lucide-react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function LoginContent() {
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

  // Check for member access denied reason in URL
  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "member_access_denied") {
      setMemberDenied(true);
      // Clean up the URL without triggering a navigation
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
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) setError(error.message);
    } catch {
      setError("Failed to sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden relative lg:flex flex-col justify-between bg-linear-to-br from-primary via-primary/90 to-primary/70 p-12 lg:w-1/2 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="top-0 left-0 absolute bg-white blur-3xl rounded-full w-72 h-72 -translate-x-1/2 -translate-y-1/2" />
          <div className="right-0 bottom-0 absolute bg-white blur-3xl rounded-full w-96 h-96 translate-x-1/3 translate-y-1/3" />
        </div>

        {/* Desktop Logo */}
        <div className="z-10 relative">
          <div className="flex items-center gap-3">
            <div className="flex justify-center items-center w-12 h-12">
              <Logo className="w-12 h-12 text-white" />
            </div>
            <span className="font-bold text-white text-2xl">JunLink Admin</span>
          </div>
        </div>

        <div className="z-10 relative">
          <h1 className="mb-4 font-bold text-white text-4xl leading-tight">
            Manage Your POS System
            <br />
            <span className="text-white/80">All in One Place</span>
          </h1>
          <p className="max-w-md text-white/70 text-lg">
            Track sales, manage members, monitor store performance, and gain
            insights with powerful analytics.
          </p>
        </div>

        <div className="z-10 relative text-white/50 text-sm">
          © 2026 JunLink. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex justify-center items-center bg-background p-8 w-full lg:w-1/2 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center items-center gap-3 mb-8">
            <div className="flex justify-center items-center w-10 h-10">
              <Logo className="w-10 h-10 text-primary" />
            </div>
            <span className="font-bold text-foreground text-xl">
              JunLink Admin
            </span>
          </div>

          <div className="mb-8">
            <h2 className="mb-2 font-bold text-foreground text-2xl">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Sign in to your account to continue"
                : "Enter your details to get started"}
            </p>
          </div>

          {memberDenied && (
            <div className="bg-amber-500/10 mb-6 px-4 py-4 border border-amber-500/30 rounded-lg animate-slide-in-up">
              <div className="flex items-start gap-3">
                <ShieldX className="mt-0.5 w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h3 className="mb-1 font-semibold text-amber-600 dark:text-amber-400">
                    Access Denied
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Member accounts cannot access the Admin Dashboard. Please
                    sign in with an Admin account or contact your store
                    administrator for access.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex justify-center items-center gap-3 bg-background hover:bg-muted/50 border border-input rounded-lg w-full py-3 font-medium text-foreground transition-all disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.23.81-.61z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-input" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 px-4 py-3 border border-destructive/20 rounded-lg text-destructive text-sm animate-slide-in-up">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block font-medium text-foreground text-sm"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="bg-background px-4 py-3 border border-input focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-ring w-full text-foreground placeholder:text-muted-foreground transition-all"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block font-medium text-foreground text-sm"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="bg-background px-4 py-3 pr-12 border border-input focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-ring w-full text-foreground placeholder:text-muted-foreground transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="top-1/2 right-4 absolute text-muted-foreground hover:text-foreground transition-colors -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div className="space-y-2 animate-slide-in-up">
                  <label
                    htmlFor="confirmPassword"
                    className="block font-medium text-foreground text-sm"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="bg-background px-4 py-3 border border-input focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-ring w-full text-foreground placeholder:text-muted-foreground transition-all"
                  />
                </div>
              )}

              {mode === "login" && (
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="border-input rounded focus:ring-primary w-4 h-4 text-primary"
                    />
                    <span className="text-muted-foreground text-sm">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/reset-password"
                    className="font-medium text-primary hover:text-primary/80 text-sm transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 px-4 py-3 rounded-lg w-full font-medium text-primary-foreground transition-all disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading
                  ? mode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "login"
                  ? "Sign in"
                  : "Create account"}
              </button>
            </form>
          </div>

          <p className="mt-8 text-muted-foreground text-sm text-center">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

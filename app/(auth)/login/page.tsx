"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldX } from "lucide-react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberDenied, setMemberDenied] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Check for member access denied reason in URL
  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'member_access_denied') {
      setMemberDenied(true);
      // Clean up the URL without triggering a navigation
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
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
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
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

      {/* Right Panel - Login Form */}
      <div className="flex justify-center items-center bg-background p-8 w-full lg:w-1/2">
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
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
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
                    Member accounts cannot access the Admin Dashboard. Please sign in with an Admin account or contact your store administrator for access.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 px-4 py-3 rounded-lg w-full font-medium text-primary-foreground transition-all disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-muted-foreground text-sm text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

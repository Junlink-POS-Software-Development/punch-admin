"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "./hooks/useAuth";
import { BrandingPanel } from "./components/BrandingPanel";
import { AccessDeniedBanner } from "./components/AccessDeniedBanner";
import { SocialAuth } from "./components/SocialAuth";
import { AuthForm } from "./components/AuthForm";

function LoginContent() {
  const auth = useAuth();
  const { mode, memberDenied, googleLoading, handleGoogleLogin, toggleMode } = auth;

  return (
    <div className="flex min-h-screen">
      <BrandingPanel />

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

          {memberDenied && <AccessDeniedBanner />}

          <div className="space-y-4">
            <SocialAuth
              onGoogleLogin={handleGoogleLogin}
              isLoading={googleLoading}
            />
            <AuthForm auth={auth} />
          </div>

          <p className="mt-8 text-muted-foreground text-sm text-center">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={toggleMode}
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

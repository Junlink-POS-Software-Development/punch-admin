import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

interface AuthFormProps {
  auth: ReturnType<typeof useAuth>;
}

export function AuthForm({ auth }: AuthFormProps) {
  const {
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
    error,
    handleAuth,
  } = auth;

  return (
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
  );
}

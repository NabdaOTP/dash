"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
// import { ThemeToggle } from "@/features/layout/components/theme-toggle";
import { LanguageSwitcher } from "@/features/layout/components/language-switcher";
import { useAuth } from "@/features/auth/context/auth-context";
import { ApiError } from "@/lib/api-client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("auth");
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 400) {
          setError(t("errors.invalidCredentials"));
        } else if (err.status === 403) {
          setError(t("errors.accountNotVerified"));
        } else {
          setError(err.message || t("errors.generic"));
        }
      } else {
        setError(t("errors.generic"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <a
          href="https://www.nabdaotp.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3"
        >
          <div className="h-14 w-14 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Nabda OTP Logo"
              width={50}
              height={50}
            />
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">
            Nabda OTP
          </span>
        </a>
        <div className="flex items-center gap-2">
          {/* <ThemeToggle /> */}
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold text-foreground">
              {t("login.title")}
            </h1>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {t("login.orLogin")}
            </span>
            <Separator className="flex-1" />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Email Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                {t("login.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-background"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  {t("login.password")}
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  {t("login.forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-background"
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 gradient-primary text-primary-foreground font-medium"
            >
              {loading ? t("login.submitting") : t("login.submit")}
            </Button>

            {/* Terms & Privacy */}
            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              {t("login.termsText")}{" "}
              <a
                href="https://www.nabdaotp.com/terms-of-service.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {t("login.termsLink")}
              </a>{" "}
              {t("login.termsAnd")}{" "}
              <a
                href="https://www.nabdaotp.com/privacy-policy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {t("login.privacyLink")}
              </a>
            </p>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t("login.noAccount")}{" "}
            <Link
              href="/signup"
              className="text-primary font-medium hover:underline"
            >
              {t("login.signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

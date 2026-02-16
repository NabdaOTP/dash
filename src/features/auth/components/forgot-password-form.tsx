"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { ThemeToggle } from "@/features/layout/components/theme-toggle";
import { LanguageSwitcher } from "@/features/layout/components/language-switcher";
import { requestReset } from "@/features/auth/services/auth-service";
import { ApiError } from "@/lib/api-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations("auth");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await requestReset({ email });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || t("errors.generic"));
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
          <div className="h-9 w-9 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Nadba OTP Logo"
              width={54}
              height={54}
            />
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">
            Nadba OTP
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
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {t("forgotPassword.title")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("forgotPassword.subtitle")}
            </p>
          </div>

          {success ? (
            <div className="bg-success/10 border border-success/20 rounded-lg px-4 py-6 text-center space-y-3">
              <CheckCircle className="h-10 w-10 text-success mx-auto" />
              <p className="text-sm text-foreground font-medium">
                {t("forgotPassword.success")}
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    {t("forgotPassword.email")}
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
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 gradient-primary text-primary-foreground font-medium"
                >
                  {loading
                    ? t("forgotPassword.submitting")
                    : t("forgotPassword.submit")}
                </Button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              {t("forgotPassword.backToLogin")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

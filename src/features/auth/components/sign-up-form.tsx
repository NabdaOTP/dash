"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/features/layout/components/theme-toggle";
import { LanguageSwitcher } from "@/features/layout/components/language-switcher";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const t = useTranslations("auth");

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 flex items-center justify-center">
            <Image src="/logo.png" alt="NadbaOTP Logo" width={36} height={36} />
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">
            NadbaOTP
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {t("signup.title")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("signup.subtitle")}
            </p>
          </div>

          {/* Email Sign Up */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                {t("signup.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                {t("signup.password")}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-background"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 gradient-primary text-primary-foreground font-medium"
            >
              {t("signup.submit")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t("signup.haveAccount")}{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              {t("signup.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

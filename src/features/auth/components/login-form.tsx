"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { ThemeToggle } from "@/features/layout/components/theme-toggle";
import { LanguageSwitcher } from "@/features/layout/components/language-switcher";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  const handleLogin = (e: React.FormEvent) => {
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
              {t("login.title")}
            </h1>
            {/* <p className="text-muted-foreground text-sm">
              {t("login.subtitle")}
            </p> */}
          </div>

          {/* QR Section */}
          {/* <div className="bg-card rounded-2xl border border-border p-8 space-y-6 shadow-card">
            <div className="flex justify-center">
              <QRCodeDisplay size={220} scanning />
            </div>

            <div className="flex items-center gap-3 justify-center">
              <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-success" />
              </div>
              <p className="text-sm font-medium text-foreground">{t("login.scanQR")}</p>
            </div>

            <div className="space-y-2 text-center">
              <p className="text-xs text-muted-foreground">{t("login.step1")}</p>
              <p className="text-xs text-muted-foreground">{t("login.step2")}</p>
              <p className="text-xs text-muted-foreground">{t("login.step3")}</p>
            </div>
          </div> */}

          {/* Divider */}
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {t("login.orLogin")}
            </span>
            <Separator className="flex-1" />
          </div>

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
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                {t("login.password")}
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
              {t("login.submit")}
            </Button>
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

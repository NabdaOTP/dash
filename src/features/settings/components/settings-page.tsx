"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle, Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth/context/auth-context";
import * as settingsService from "../services/settings-service";
import { ApiError } from "@/lib/api-client";

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const t = useTranslations("settings");

  // Profile
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // 2FA
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaStep, setTwoFaStep] = useState<"idle" | "confirm-enable" | "confirm-disable">("idle");
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaSuccess, setTwoFaSuccess] = useState("");
  const [twoFaError, setTwoFaError] = useState("");

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess(false);
    try {
      await settingsService.updateProfile({ name, email, phone });
      await refreshUser();
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : t("profile.title"));
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError(t("password.mismatch"));
      return;
    }
    setPasswordSaving(true);
    setPasswordError("");
    setPasswordSuccess(false);
    try {
      await settingsService.changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Error");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleEnable2fa = async () => {
    setTwoFaLoading(true);
    setTwoFaError("");
    try {
      await settingsService.enable2fa();
      setTwoFaStep("confirm-enable");
    } catch (err) {
      setTwoFaError(err instanceof ApiError ? err.message : "Error");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleConfirm2fa = async () => {
    setTwoFaLoading(true);
    setTwoFaError("");
    try {
      if (twoFaStep === "confirm-enable") {
        await settingsService.confirm2fa(twoFaCode);
        setTwoFaSuccess(t("twoFactor.enableSuccess"));
      } else {
        await settingsService.disable2fa(twoFaCode);
        setTwoFaSuccess(t("twoFactor.disableSuccess"));
      }
      await refreshUser();
      setTwoFaStep("idle");
      setTwoFaCode("");
    } catch (err) {
      setTwoFaError(err instanceof ApiError ? err.message : "Error");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleDisable2fa = async () => {
    setTwoFaLoading(true);
    setTwoFaError("");
    try {
      await settingsService.requestDisable2fa();
      setTwoFaStep("confirm-disable");
    } catch (err) {
      setTwoFaError(err instanceof ApiError ? err.message : "Error");
    } finally {
      setTwoFaLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Profile Section */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">{t("profile.title")}</h2>

        {profileSuccess && (
          <div className="flex items-center gap-2 text-success text-sm">
            <CheckCircle className="h-4 w-4" />
            {t("profile.success")}
          </div>
        )}
        {profileError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("profile.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={profileSaving} />
          </div>
          <div className="space-y-2">
            <Label>{t("profile.email")}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={profileSaving} />
          </div>
          <div className="space-y-2">
            <Label>{t("profile.phone")}</Label>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={profileSaving} />
          </div>
          <Button type="submit" disabled={profileSaving} className="gradient-primary text-primary-foreground">
            {profileSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {profileSaving ? t("profile.saving") : t("profile.save")}
          </Button>
        </form>
      </div>

      <Separator />

      {/* Password Section */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">{t("password.title")}</h2>

        {passwordSuccess && (
          <div className="flex items-center gap-2 text-success text-sm">
            <CheckCircle className="h-4 w-4" />
            {t("password.success")}
          </div>
        )}
        {passwordError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("password.current")}</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={passwordSaving} required />
          </div>
          <div className="space-y-2">
            <Label>{t("password.new")}</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} disabled={passwordSaving} required />
            <p className="text-xs text-muted-foreground">{t("password.hint")}</p>
          </div>
          <div className="space-y-2">
            <Label>{t("password.confirm")}</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} disabled={passwordSaving} required />
          </div>
          <Button type="submit" disabled={passwordSaving} className="gradient-primary text-primary-foreground">
            {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {passwordSaving ? t("password.saving") : t("password.save")}
          </Button>
        </form>
      </div>

      <Separator />

      {/* 2FA Section */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">{t("twoFactor.title")}</h2>

        <div className="flex items-center gap-3">
          {user?.twoFactorEnabled ? (
            <>
              <Shield className="h-5 w-5 text-success" />
              <span className="text-sm text-success font-medium">{t("twoFactor.enabled")}</span>
            </>
          ) : (
            <>
              <ShieldOff className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("twoFactor.disabled")}</span>
            </>
          )}
        </div>

        {twoFaSuccess && (
          <div className="flex items-center gap-2 text-success text-sm">
            <CheckCircle className="h-4 w-4" />
            {twoFaSuccess}
          </div>
        )}
        {twoFaError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
            {twoFaError}
          </div>
        )}

        {twoFaStep !== "idle" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("twoFactor.confirmCode")}</p>
            <div className="space-y-2">
              <Label>{t("twoFactor.code")}</Label>
              <Input
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value)}
                maxLength={6}
                className="text-center tracking-widest font-mono"
                disabled={twoFaLoading}
              />
            </div>
            <Button
              onClick={handleConfirm2fa}
              disabled={twoFaLoading || twoFaCode.length < 6}
              className="gradient-primary text-primary-foreground"
            >
              {twoFaLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {twoFaLoading ? t("twoFactor.confirming") : t("twoFactor.confirm")}
            </Button>
          </div>
        ) : user?.twoFactorEnabled ? (
          <Button
            variant="outline"
            onClick={handleDisable2fa}
            disabled={twoFaLoading}
            className="text-destructive border-destructive/20"
          >
            {twoFaLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t("twoFactor.disable")}
          </Button>
        ) : (
          <Button
            onClick={handleEnable2fa}
            disabled={twoFaLoading}
            className="gradient-primary text-primary-foreground"
          >
            {twoFaLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t("twoFactor.enable")}
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import * as whatsappService from "@/features/whatsapp/services/whatsapp-service";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  BookOpen,
  Layers,
  Loader2,
  Plus,
  Wifi,
  WifiOff
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { getDashboardData, type DashboardStats } from "../services/dashboard-service";

type WaStep = "idle" | "connecting" | "awaiting_scan";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [waStep, setWaStep] = useState<WaStep>("idle");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [disconnectingWa, setDisconnectingWa] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const fetchData = async () => {
    try {
      const data = await getDashboardData();
      setStats(data);
    } catch {
      // handled by api client
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => stopPolling();
  }, []);

  // const handleConnectWhatsApp = async () => {
  //   setWaStep("connecting");
  //   try {
  //     await whatsappService.connect();
  //   } catch {
  //     setWaStep("idle");
  //     return;
  //   }

  //   setWaStep("awaiting_scan");

  //   const poll = async () => {
  //     try {
  //       const status = await whatsappService.getStatus();
  //       if (status.status === "connected") {
  //         stopPolling();
  //         setWaStep("idle");
  //         setQrCode(null);
  //         setLoading(true);
  //         await fetchData();
  //         return;
  //       }
  //     } catch {
  //       // continue polling
  //     }
  //     try {
  //       const qrData = await whatsappService.getQrCode();
  //       if (qrData.qr) setQrCode(qrData.qr);
  //     } catch {
  //       // QR not ready yet
  //     }
  //   };

  //   poll();
  //   pollRef.current = setInterval(poll, 3000);
  // };

  // const handleCancelConnect = () => {
  //   stopPolling();
  //   setWaStep("idle");
  //   setQrCode(null);
  // };

  // const handleDisconnectWhatsApp = async () => {
  //   setDisconnectingWa(true);
  //   try {
  //     await whatsappService.disconnect();
  //     await fetchData();
  //   } catch {
  //     // handled
  //   } finally {
  //     setDisconnectingWa(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeCount = stats?.activeInstances ?? 0;
  const stoppedCount = stats?.stoppedInstances ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{t("welcome")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      {/* UltraMsg-style Instance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Active Instances */}
        <div className="rounded-xl overflow-hidden shadow-sm">
          <div className="bg-[#4caf50] p-6 flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-white">{activeCount}</p>
              <p className="text-white/90 font-semibold mt-1 uppercase tracking-wide text-sm">
                ACTIVE
              </p>
            </div>
            <Layers className="h-14 w-14 text-white/30" />
          </div>
          <Link
            href="/instances"
            className="flex items-center justify-between bg-[#43a047] px-6 py-3 hover:bg-[#388e3c] transition-colors group"
          >
            <span className="text-white font-medium text-sm">View Details</span>
            <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Stopped Instances */}
        <div className="rounded-xl overflow-hidden shadow-sm">
          <div className="bg-[#f44336] p-6 flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-white">{stoppedCount}</p>
              <p className="text-white/90 font-semibold mt-1 uppercase tracking-wide text-sm">
                STOPPED
              </p>
            </div>
            <Layers className="h-14 w-14 text-white/30" />
          </div>
          <Link
            href="/instances"
            className="flex items-center justify-between bg-[#e53935] px-6 py-3 hover:bg-[#c62828] transition-colors group"
          >
            <span className="text-white font-medium text-sm">View Details</span>
            <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* WhatsApp Status Card */}
      {/* <div className="bg-card rounded-xl border border-border p-6">
        {waStep === "awaiting_scan" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{t("connectWhatsApp")}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelConnect}
                className="text-xs text-muted-foreground"
              >
                {t("cancelConnect")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("scanQR")}</p>
            {qrCode ? (
              <img
                src={qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`}
                alt="WhatsApp QR Code"
                className="w-44 h-44 rounded-lg border border-border"
              />
            ) : (
              <div className="w-44 h-44 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  stats?.whatsappConnected ? "bg-success/10" : "bg-muted"
                }`}
              >
                {stats?.whatsappConnected ? (
                  <Wifi className="h-5 w-5 text-success" />
                ) : (
                  <WifiOff className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <p className="font-semibold text-foreground">
                  {stats?.whatsappConnected ? t("connected") : t("disconnected")}
                </p>
                {stats?.whatsappPhone && (
                  <p className="text-xs text-muted-foreground mt-0.5">{stats.whatsappPhone}</p>
                )}
              </div>
            </div>
            {stats?.whatsappConnected ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnectWhatsApp}
                disabled={disconnectingWa}
                className="text-xs text-destructive"
              >
                {disconnectingWa ? <Loader2 className="h-3 w-3 animate-spin" /> : t("disconnect")}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleConnectWhatsApp}
                disabled={waStep === "connecting"}
                className="text-xs text-primary"
              >
                {waStep === "connecting" ? <Loader2 className="h-3 w-3 animate-spin" /> : t("connect")}
              </Button>
            )}
          </div>
        )}
      </div> */}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/instances"
          className="group bg-card rounded-xl border border-border p-6 text-start hover:shadow-elevated hover:border-primary/30 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("createInstance")}</h3>
              <p className="text-sm text-muted-foreground">{t("createInstanceDesc")}</p>
            </div>
          </div>
        </Link>

        <Link
          href="/api-docs"
          className="group bg-card rounded-xl border border-border p-6 text-start hover:shadow-elevated hover:border-primary/30 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("viewDocs")}</h3>
              <p className="text-sm text-muted-foreground">{t("viewDocsDesc")}</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
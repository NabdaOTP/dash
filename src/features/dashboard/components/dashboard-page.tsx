"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Plus, BookOpen } from "lucide-react";
// import { QRCodeDisplay } from "@/components/qr-code-display";
// import { StatsCard } from "./stats-card";

export function DashboardPage() {
  const t = useTranslations("dashboard");

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      {/* <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{t("welcome")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div> */}

      {/* QR Code Section */}
      {/* <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <QRCodeDisplay size={180} scanning />
          <div className="flex-1 space-y-4 text-center lg:text-start">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">{t("connectWhatsApp")}</h2>
              <p className="text-sm text-muted-foreground max-w-md">{t("scanQR")}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                {t("connected")}: +966 **** 1234
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-warning" />
                {t("sessionExpires")}: 23h
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Stats Grid */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title={t("activeSessions")}
          value="12"
          icon={Activity}
          trend={t("trendSessions")}
          trendUp
        />
        <StatsCard
          title={t("apiCalls")}
          value="2,847"
          icon={PhoneCall}
          trend={t("trendApiCalls")}
          trendUp
        />
        <StatsCard
          title={t("successRate")}
          value="98.5%"
          icon={CheckCircle}
          trend={t("trendSuccessRate")}
          trendUp
        />
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
              <h3 className="font-semibold text-foreground">
                {t("createInstance")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("createInstanceDesc")}
              </p>
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
              <p className="text-sm text-muted-foreground">
                {t("viewDocsDesc")}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

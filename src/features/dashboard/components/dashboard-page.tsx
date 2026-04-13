"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, BookOpen, Gift, Layers, Loader2, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getDashboardData, type DashboardStats } from "../services/dashboard-service";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("dashboard");
  const locale = useLocale();

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
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeCount = stats?.activeInstances ?? 0;
  const stoppedCount = stats?.stoppedInstances ?? 0;
  const totalPoints = stats?.totalPoints ?? 0;
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{t("welcome")}</h1>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Active Instances */}
        <div className="rounded-xl overflow-hidden shadow-sm border border-green-200 dark:border-green-900">
          <div className="bg-[#4caf50] p-6 flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-white">{activeCount}</p>
              <p className="text-white/90 font-semibold mt-1 uppercase tracking-wide text-sm">
                {t("activeInstance")}
              </p>
            </div>
            <Layers className="h-14 w-14 text-white/30" />
          </div>
          <Link
            href="/instances"
            className="flex items-center justify-between bg-[#43a047] px-6 py-3 hover:bg-[#388e3c] transition-colors group"
          >
            <span className="text-white font-medium text-sm">{t("viewDetails")}</span>
            <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Stopped Instances */}
        <div className="rounded-xl overflow-hidden shadow-sm border border-red-200 dark:border-red-900">
          <div className="bg-[#f44336] p-6 flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-white">{stoppedCount}</p>
              <p className="text-white/90 font-semibold mt-1 uppercase tracking-wide text-sm">
                {t("stoppedInstance")}
              </p>
            </div>
            <Layers className="h-14 w-14 text-white/30" />
          </div>
          <Link
            href="/instances"
            className="flex items-center justify-between bg-[#e53935] px-6 py-3 hover:bg-[#c62828] transition-colors group"
          >
            <span className="text-white font-medium text-sm">{t("viewDetails")}</span>
            <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Referral Points Card */}
        <div className="rounded-xl overflow-hidden shadow-sm border border-red-200 dark:border-red-900">
          <div style={{ backgroundColor: "#7c3aed" }} className="p-6 flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-white">{totalPoints}</p>
              <p className="text-white/90 font-semibold mt-1 uppercase tracking-wide text-sm">
                {t("referralPoints")}
              </p>
            </div>
            <Gift className="h-14 w-14 text-white/30" />
          </div>
          <Link
            href="/referrals"
            style={{ backgroundColor: "#6d28d9" }}
            className="flex items-center justify-between bg-[#6d28d9] px-6 py-3 
               hover:bg-[#5b21b6] active:bg-[#4c1d95] 
               transition-all duration-200 group"
          >
            <span className="text-white font-medium text-sm">{t("viewDetails")}</span>
            <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
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
          href="https://api.nabdaotp.com/docs"
          target="_blank"
          rel="noopener noreferrer"
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
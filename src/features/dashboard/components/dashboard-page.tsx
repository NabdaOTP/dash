"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, BookOpen, Layers, Loader2, Plus } from "lucide-react";
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{t("welcome")}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
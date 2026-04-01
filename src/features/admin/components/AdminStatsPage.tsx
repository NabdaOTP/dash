"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getAdminStats } from "@/features/admin/services/admin-service";
import {
    CreditCard,
    DollarSign, Loader2,
    Server,
    TrendingUp,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AdminStatsData {
    totals: {
        users: number;
        instances: number;
        activeSubscriptions: number;
        mrr: number;
    };
    invoices: {
        totalPaid: number;
    };
}

function StatCard({
    title,
    value,
    icon: Icon,
    color,
    prefix = "",
    suffix = "",
}: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    prefix?: string;
    suffix?: string;
}) {
    return (
        <Card className="overflow-hidden border border-border shadow-sm">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">{title}</p>
                        <p className="text-3xl font-bold text-foreground mt-1">
                            {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
                        </p>
                    </div>
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminStatsPage() {
    const [stats, setStats] = useState<AdminStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAdminStats()
            .then((data) => setStats(data as unknown as AdminStatsData))
            .catch(() => setError("Failed to load stats"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-destructive">{error ?? "No data available"}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">Platform overview and key metrics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <StatCard
                    title="Total Users"
                    value={stats.totals.users}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Instances"
                    value={stats.totals.instances}
                    icon={Server}
                    color="bg-violet-500"
                />
                <StatCard
                    title="Active Subscriptions"
                    value={stats.totals.activeSubscriptions}
                    icon={CreditCard}
                    color="bg-green-500"
                />
                <StatCard
                    title="Monthly Recurring Revenue"
                    value={stats.totals.mrr}
                    icon={TrendingUp}
                    color="bg-orange-500"
                    prefix="$"
                />
                <StatCard
                    title="Total Revenue (Invoices)"
                    value={stats.invoices.totalPaid}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    prefix="$"
                />
            </div>
        </div>
    );
}
"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getAdminSubscriptions } from "@/features/admin/services/admin-service";
import type { AdminSubscription } from "@/features/admin/types";
import { Loader2, Search, Check, X } from "lucide-react";
import { toast } from "sonner";

function formatDate(dateStr?: string | null): string {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } catch { return "—"; }
}

const statusStyles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
    EXPIRED: "bg-gray-100 text-gray-600 border-gray-200",
    TRIAL: "bg-blue-100 text-blue-700 border-blue-200",
    PAST_DUE: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    const fetchSubscriptions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminSubscriptions(page, limit);
            setSubscriptions(res.items);
            setTotal(res.meta.total);
            setTotalPages(res.meta.pages);
        } catch {
            toast.error("Failed to load subscriptions");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

    const filtered = subscriptions.filter((s) =>
        s.instanceId?.toLowerCase().includes(search.toLowerCase()) ||
        s.plan?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.plan?.code?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
                <p className="text-sm text-muted-foreground mt-1">{total} total subscriptions</p>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by instance ID or plan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="ps-9 bg-card"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="w-10">#</TableHead>
                                    <TableHead>Instance ID</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Interval</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead>Auto Renew</TableHead>
                                    <TableHead>Period End</TableHead>
                                    <TableHead>Started</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                                            No subscriptions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((sub, index) => (
                                        <TableRow key={sub.id}>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {(page - 1) * limit + index + 1}
                                            </TableCell>
                                            <TableCell className="text-xs font-mono text-muted-foreground">
                                                {sub.instanceId?.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell>
                                                {sub.plan ? (
                                                    <div>
                                                        <p className="text-sm font-medium">{sub.plan.name}</p>
                                                        <Badge variant="outline" className="text-xs font-mono mt-0.5">
                                                            {sub.plan.code}
                                                        </Badge>
                                                    </div>
                                                ) : "—"}
                                            </TableCell>
                                            <TableCell className="font-semibold text-sm">
                                                ${sub.priceUsd ?? "—"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-xs ${sub.billingInterval === "YEARLY" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}>
                                                    {sub.billingInterval ?? "—"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-xs ${statusStyles[sub.status] ?? "bg-muted text-muted-foreground"}`}>
                                                    {sub.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {sub.isActive
                                                    ? <Check className="h-4 w-4 text-green-600" />
                                                    : <X className="h-4 w-4 text-muted-foreground" />}
                                            </TableCell>
                                            <TableCell>
                                                {sub.autoRenew
                                                    ? <Check className="h-4 w-4 text-green-600" />
                                                    : <X className="h-4 w-4 text-muted-foreground" />}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDate(sub.currentPeriodEnd)}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDate(sub.startedAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                            <p className="text-xs text-muted-foreground">
                                Page {page} of {totalPages} • {total} subscriptions
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1 || loading}>
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages || loading}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
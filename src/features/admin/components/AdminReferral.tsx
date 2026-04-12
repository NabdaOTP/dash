"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Gift } from "lucide-react";

import * as adminService from "../services/admin-service";
import type {
    AdminReferralWithdrawal,
    AdminReferralSettings,
} from "../types";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function AdminReferral() {
    const [activeTab, setActiveTab] = useState<"withdrawals" | "settings">("withdrawals");
    const [showBackfillDialog, setShowBackfillDialog] = useState(false);
    // Withdrawals
    const [withdrawals, setWithdrawals] = useState<AdminReferralWithdrawal[]>([]);
    const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);

    // Settings
    const [settings, setSettings] = useState<AdminReferralSettings | null>(null);
    const [settingsLoading, setSettingsLoading] = useState(true);

    const fetchWithdrawals = async () => {
        setWithdrawalsLoading(true);
        try {
            const res = await adminService.getAdminReferralWithdrawals(1, 20);
            setWithdrawals(res.items);
        } catch {
            toast.error("Failed to load withdrawal requests");
        } finally {
            setWithdrawalsLoading(false);
        }
    };

    const fetchSettings = async () => {
        setSettingsLoading(true);
        try {
            const data = await adminService.getAdminReferralSettings();
            setSettings(data);
        } catch {
            toast.error("Failed to load referral settings");
        } finally {
            setSettingsLoading(false);
        }
    };

    // Auto load when tab changes
    useEffect(() => {
        if (activeTab === "withdrawals") {
            fetchWithdrawals();
        } else if (activeTab === "settings") {
            fetchSettings();
        }
    }, [activeTab]);

    const handleUpdateWithdrawal = async (id: string, status: "APPROVED" | "REJECTED") => {
        if (!confirm(`Are you sure you want to ${status.toLowerCase()} this withdrawal?`)) return;

        try {
            await adminService.updateAdminReferralWithdrawal(id, { status });
            toast.success(`Withdrawal ${status.toLowerCase()} successfully`);
            fetchWithdrawals();
        } catch {
            toast.error("Failed to update withdrawal");
        }
    };

    const handleBackfill = async () => {
        setShowBackfillDialog(false);

        try {
            await adminService.backfillReferrals();
            toast.success("Referral codes generated successfully for existing users");
        } catch {
            toast.error("Failed to backfill referral codes");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Gift className="h-8 w-8 text-primary" />
                    Referrals & Points
                </h1>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList>
                    <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
                    <TabsTrigger value="settings">System Settings</TabsTrigger>
                </TabsList>

                {/* Withdrawals Tab */}
                <TabsContent value="withdrawals" className="space-y-6">
                    {withdrawalsLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : withdrawals.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No withdrawal requests yet
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-end">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {withdrawals.map((w) => (
                                            <TableRow key={w.id}>
                                                <TableCell>{w.userName || w.userId}</TableCell>
                                                <TableCell className="font-medium">{w.amount}</TableCell>
                                                <TableCell>{w.contactDetails}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            w.status === "APPROVED" ? "default" :
                                                                w.status === "REJECTED" ? "destructive" : "secondary"
                                                        }
                                                    >
                                                        {w.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{new Date(w.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-end space-x-2">
                                                    {w.status === "PENDING" && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => handleUpdateWithdrawal(w.id, "APPROVED")}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleUpdateWithdrawal(w.id, "REJECTED")}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    {settingsLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : settings ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Referral Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Min Withdrawal Amount</p>
                                        <p className="text-2xl font-bold">{settings.minWithdrawalAmount}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Points per Subscription</p>
                                        <p className="text-2xl font-bold">{settings.pointsPerSubscription}</p>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setShowBackfillDialog(true)}
                                >
                                    Backfill Referral Codes
                                </Button>
                            </CardContent>
                        </Card>
                    ) : null}
                </TabsContent>
            </Tabs>
            {/* Backfill Confirmation Dialog */}
            <Dialog open={showBackfillDialog} onOpenChange={setShowBackfillDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Backfill Referral Codes</DialogTitle>
                        <DialogDescription>
                            This action will generate referral codes for all existing users who don't have one yet.<br />
                            Are you sure you want to continue?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowBackfillDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleBackfill}
                        >
                            Yes, Generate Codes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
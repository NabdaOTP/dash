"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Gift, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import * as adminService from "../services/admin-service";
import type { AdminReferralWithdrawal, AdminReferralSettings } from "../types";

// helpers 
const statusVariant = (s: string) =>
  s === "APPROVED" ? "default" : s === "REJECTED" ? "destructive" : "secondary";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString();
}

// component 
export function AdminReferral() {
  const [activeTab, setActiveTab] = useState<"withdrawals" | "settings">("withdrawals");

  // Withdrawals
  const [withdrawals, setWithdrawals] = useState<AdminReferralWithdrawal[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });

  // Resolve dialog
  const [resolveTarget, setResolveTarget] = useState<{
    id: string; action: "APPROVED" | "REJECTED";
  } | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [resolving, setResolving] = useState(false);

  // Settings
  const [settings, setSettings] = useState<AdminReferralSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsForm, setSettingsForm] = useState({
    minWithdrawalAmount: 0,
    pointsPerSubscription: 0,
    recurringPointsPeriodMonths: 0,
    isEnabled: true,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Backfill
  const [showBackfillDialog, setShowBackfillDialog] = useState(false);
  const [backfilling, setBackfilling] = useState(false);

  // fetchers 
  const fetchWithdrawals = async (p = page) => {
    setWithdrawalsLoading(true);
    try {
      const res = await adminService.getAdminReferralWithdrawals(p, 20);
      setWithdrawals(res.items);
      setMeta({ total: res.meta.total, pages: res.meta.pages });
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
      setSettingsForm({
        minWithdrawalAmount: data.minWithdrawalAmount,
        pointsPerSubscription: data.pointsPerSubscription,
        recurringPointsPeriodMonths: data.recurringPointsPeriodMonths,
        isEnabled: data.isEnabled,
      });
    } catch {
      toast.error("Failed to load referral settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "withdrawals") fetchWithdrawals();
    else fetchSettings();
  }, [activeTab]);

  // re-fetch when page changes
  useEffect(() => {
    if (activeTab === "withdrawals") fetchWithdrawals(page);
  }, [page]);

  // handlers 
  const handleResolve = async () => {
    if (!resolveTarget) return;
    setResolving(true);
    try {
      await adminService.updateAdminReferralWithdrawal(resolveTarget.id, {
        status: resolveTarget.action,
        ...(adminNote.trim() && { adminNote: adminNote.trim() }),
      });
      toast.success(`Withdrawal ${resolveTarget.action.toLowerCase()} successfully`);
      setResolveTarget(null);
      setAdminNote("");
      fetchWithdrawals();
    } catch {
      toast.error("Failed to update withdrawal");
    } finally {
      setResolving(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      await adminService.updateAdminReferralSettings(settingsForm);
      toast.success("Settings updated successfully");
      fetchSettings();
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleBackfill = async () => {
    setShowBackfillDialog(false);
    setBackfilling(true);
    try {
      const res = await adminService.backfillReferrals();
      toast.success(res.message || "Referral codes generated successfully");
    } catch {
      toast.error("Failed to backfill referral codes");
    } finally {
      setBackfilling(false);
    }
  };

  // render
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Gift className="h-8 w-8 text-primary" />
        Referrals & Points
      </h1>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        {/* Withdrawals */}
        <TabsContent value="withdrawals" className="space-y-4">
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
            <>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Note</TableHead>
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
                          {/* adminNote */}
                          <TableCell className="text-muted-foreground text-xs max-w-37.5 truncate">
                            {w.adminNote || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(w.status)}>{w.status}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(w.createdAt)}</TableCell>
                          <TableCell className="text-end space-x-2">
                            {w.status === "PENDING" && (
                              <>
                                <Button size="sm"
                                  onClick={() => setResolveTarget({ id: w.id, action: "APPROVED" })}>
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive"
                                  onClick={() => setResolveTarget({ id: w.id, action: "REJECTED" })}>
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

              {/* Pagination */}
              {meta.pages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Total: {meta.total} requests</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span>Page {page} of {meta.pages}</span>
                    <Button variant="outline" size="icon" disabled={page === meta.pages}
                      onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4">
          {settingsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : settings ? (
            <Card>
              <CardHeader>
                <CardTitle>Referral Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {/* editable form */}
                <form onSubmit={handleSaveSettings} className="space-y-4 max-w-md">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isEnabled"
                      aria-label="Referral Program Enabled"
                      checked={settingsForm.isEnabled}
                      onChange={(e) =>
                        setSettingsForm(f => ({ ...f, isEnabled: e.target.checked }))
                      }
                      className="h-4 w-4 accent-primary"
                    />
                    <Label htmlFor="isEnabled">Referral Program Enabled</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Min Withdrawal Amount</Label>
                    <Input type="number" min={0}
                      value={settingsForm.minWithdrawalAmount}
                      onChange={(e) =>
                        setSettingsForm(f => ({ ...f, minWithdrawalAmount: Number(e.target.value) }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Points per Subscription</Label>
                    <Input type="number" min={0}
                      value={settingsForm.pointsPerSubscription}
                      onChange={(e) =>
                        setSettingsForm(f => ({ ...f, pointsPerSubscription: Number(e.target.value) }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Recurring Points Period (months)</Label>
                    <Input type="number" min={1}
                      value={settingsForm.recurringPointsPeriodMonths}
                      onChange={(e) =>
                        setSettingsForm(f => ({ ...f, recurringPointsPeriodMonths: Number(e.target.value) }))
                      }
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={settingsSaving} className="gradient-primary text-primary-foreground">
                      {settingsSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Save Settings
                    </Button>

                    <Button type="button" variant="outline"
                      disabled={backfilling}
                      onClick={() => setShowBackfillDialog(true)}>
                      {backfilling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Backfill Referral Codes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>

      {/* Resolve Dialog — adminNote */}
      <Dialog open={!!resolveTarget} onOpenChange={() => { setResolveTarget(null); setAdminNote(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resolveTarget?.action === "APPROVED" ? "Approve" : "Reject"} Withdrawal
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {resolveTarget?.action?.toLowerCase()} this request?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Admin Note (optional)</Label>
            <Textarea
              placeholder="Add a note for the user..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setResolveTarget(null); setAdminNote(""); }}>
              Cancel
            </Button>
            <Button
              variant={resolveTarget?.action === "APPROVED" ? "default" : "destructive"}
              onClick={handleResolve}
              disabled={resolving}
            >
              {resolving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {resolveTarget?.action === "APPROVED" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backfill Dialog */}
      <Dialog open={showBackfillDialog} onOpenChange={setShowBackfillDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backfill Referral Codes</DialogTitle>
            <DialogDescription>
              This will generate referral codes for all existing users who don't have one.
              Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBackfillDialog(false)}>Cancel</Button>
            <Button onClick={handleBackfill}>Yes, Generate Codes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/features/auth/context/auth-context";
import * as billingService from "@/features/billing/services/billing-service";
import { DialogDescription } from "@radix-ui/react-dialog";
import {
  CalendarPlus, CreditCard, Loader2, PanelTopClose, PanelTopOpen,
  Pencil, Plus, Rocket, Search, Server, Trash2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import * as instancesService from "../services/instances-service";
import type { Instance } from "../types";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  ACTIVE: "bg-success/10 text-success border-success/20",
  TRIAL: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  PAYMENT_PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
};

function isTrialInstance(inst: Instance) {
  return inst.isTrialInstance === true || inst.status === "TRIAL" || inst.expiresAt != null;
}

function getRowBg(status: string) {
  if (status === "ACTIVE" || status === "active" || status === "TRIAL")
    return "bg-green-50 dark:bg-green-950/20";
  if (status === "PAYMENT_PENDING") return "bg-red-50 dark:bg-red-950/20";
  return "";
}

// ✅ date form
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch { return "—"; }
}

function formatTrialEnd(trialEnd: string | null | undefined): string {
  if (!trialEnd) return "—";
  return formatDate(trialEnd);
}

export function InstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingInstance, setEditingInstance] = useState<Instance | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [creatingdia, setCreatingdia] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "createdAt", direction: "desc",
  });
  const [payingInstanceId, setPayingInstanceId] = useState<string | null>(null);
  const [extendTrialId, setExtendTrialId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showExtendTrialConfirm, setShowExtendTrialConfirm] = useState<string | null>(null);
  const t = useTranslations("instances");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { selectInstance } = useAuth();

  const fetchInstances = useCallback(async () => {
    try {
      const data = await instancesService.getMyInstances();
      setInstances(data);
    } catch {
      toast.error("Failed to load instances");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInstances(); }, [fetchInstances]);

  const handleCreate = async () => {
    const minDelay = new Promise((res) => setTimeout(res, 1500));
    setShowCreateConfirm(false);
    setCreating(true);
    setCreatingdia(true);
    try {
      const isFirstInstance = instances.length === 0;
      const created = await instancesService.createInstance();

      if (isFirstInstance) {
        await selectInstance({ instanceId: created.id });
        try {
          const plans = await billingService.getPlans();
          const planId = plans[0]?.id;
          if (planId) {
            await billingService.startTrial(planId);
            toast.success("Trial started for your first instance");
          }
        } catch (err: unknown) {
          const message = (err as { message?: string })?.message ?? "";
          const status = (err as { status?: number })?.status;
          const isAlreadyExists =
            status === 409 ||
            message.toLowerCase().includes("already") ||
            message.toLowerCase().includes("exist");
          if (!isAlreadyExists) {
            toast.error(message || "Failed to start trial");
          }
        }
      }

      await Promise.all([fetchInstances(), minDelay]);
      toast.success(t("instanceCreated"));
    } catch {
      toast.error("Failed to create instance");
    } finally {
      setCreating(false);
      setCreatingdia(false);
    }
  };

  const handleEdit = (inst: Instance) => {
    setEditingInstance(inst);
    setEditName(inst.name || "");
  };

  const handleSaveEdit = async () => {
    if (!editingInstance || !editName.trim()) return;
    setSaving(true);
    try {
      await selectInstance({ instanceId: editingInstance.id });
      await instancesService.updateInstance(editingInstance.id, { name: editName });
      setEditingInstance(null);
      await fetchInstances();
      toast.success("Instance name updated");
    } catch {
      toast.error("Failed to update instance");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteConfirmId(null);
    try {
      await selectInstance({ instanceId: id });
      await instancesService.deleteInstance(id);
      await fetchInstances();
      toast.success("Instance deleted successfully");
    } catch (err: any) {
      toast.error(err?.status === 403
        ? "Cannot delete: Instance is in PAYMENT_PENDING or permission denied"
        : "Failed to delete instance");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleExtendTrial = async (instanceId: string) => {
    setShowExtendTrialConfirm(null);
    setExtendTrialId(instanceId);
    try {
      await selectInstance({ instanceId });
      await billingService.extendTrialForInstance(instanceId);
      await fetchInstances();
      toast.success("Trial extended successfully");
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Failed to extend trial");
    } finally {
      setExtendTrialId(null);
    }
  };

  const handleActivatePay = async (instanceId: string) => {
    setPayingInstanceId(instanceId);
    try {
      await selectInstance({ instanceId });
      const plans = await billingService.getPlans();
      const planId = plans[0]?.id;
      if (!planId) { toast.error("No billing plan available"); return; }
      const result = await billingService.subscribe(planId);
      const checkoutUrl = (result as any)?.url ?? (result as any)?.checkoutUrl;
      if (!checkoutUrl) { toast.error("No checkout URL returned"); return; }
      window.location.href = checkoutUrl;
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Failed to start payment");
    } finally {
      setPayingInstanceId(null);
    }
  };

 // function made by front manually not from backend response 
  function getDisplayExpiry(inst: Instance): string {
  if (!inst.expiresAt) return "—";
  const expires = new Date(inst.expiresAt);
  const created = new Date(inst.createdAt);
  const sameDay = expires.toDateString() === created.toDateString();
  if (sameDay && !inst.isTrialInstance) {
    const calculated = new Date(created);
    calculated.setMonth(calculated.getMonth() + 1);
    return formatDate(calculated.toISOString());
  }
  
  return formatDate(inst.expiresAt);
}
  const filtered = instances.filter((inst) =>
    inst.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedInstances = [...filtered].sort((a, b) => {
    if (sortConfig.key === "createdAt") {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortConfig.direction === "asc" ? diff : -diff;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button
          onClick={() => setShowCreateConfirm(true)}
          disabled={creating}
          className="gradient-primary text-primary-foreground gap-2 shrink-0"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {t("create")}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-9 bg-card"
        />
      </div>

      {sortedInstances.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {instances.length === 0 ? t("noInstances") : t("noResults")}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">{t("name")}</TableHead>
                  <TableHead className="font-semibold cursor-pointer" onClick={() => handleSort("createdAt")}>
                    {t("creatDate")}{" "}
                    {sortConfig.key === "createdAt" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="font-semibold">{t("expireDate")}</TableHead>
                  <TableHead className="font-semibold">{t("status")}</TableHead>
                  <TableHead className="font-semibold text-end">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInstances.map((inst) => {
                  const isPending = inst.status === "PAYMENT_PENDING";
                  //  is trail condition to view or hide the pay button
                  const isTrial = inst.status === "TRIAL" || inst.isTrialInstance === true;
                  const isActive = inst.status === "ACTIVE" || inst.status === "active";
                  //  Pay: show always for free trail and hide it when the user pay
                  const showPay = isTrial || isPending;
                  return (
                    <Fragment key={inst.id}>
                      <TableRow
                        className={`transition-colors ${getRowBg(inst.status)} ${isPending ? "cursor-not-allowed opacity-90" : "cursor-pointer"}`}
                        onClick={() => !isPending && router.push(`/${locale}/instances/${inst.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Server className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{inst.name}</span>
                          </div>
                        </TableCell>

                        {/* ✅ date: yyyy-MM-dd */}
                        <TableCell>{formatDate(inst.createdAt)}</TableCell>
                        <TableCell>
                          {/* {isTrialInstance(inst) ? formatTrialEnd(inst.expiresAt ?? inst.trialEnd) : "—"} */}
                          {getDisplayExpiry(inst)}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${statusStyles[inst.status] ?? "bg-muted text-muted-foreground"}`}>
                            {inst.status === "PAYMENT_PENDING" ? "Payment Pending" : inst.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 flex-wrap">

                            {/* ✅ instead of eye icon */}
                            {!isPending && (
                              <Link href={`/${locale}/instances/${inst.id}`}>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-600 text-white gap-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Rocket className="h-3.5 w-3.5" />
                                  Manage
                                </Button>
                              </Link>
                            )}

                            {/* ✅ Pay — trail and payment pending*/}
                            {showPay && (
                              <Button
                                variant="default" size="sm"
                                className="bg-linear-to-r from-[#A78BFA] to-[#7C3AED] hover:from-[#9F7AEA] hover:to-[#6D28D9] text-white gap-2"
                                onClick={(e) => { e.stopPropagation(); handleActivatePay(inst.id); }}
                                disabled={!!payingInstanceId}
                              >
                                {payingInstanceId === inst.id
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <CreditCard className="h-4 w-4" />}
                                {payingInstanceId === inst.id ? "Redirecting…" : "Pay"}
                              </Button>
                            )}

                            {/* ✅ More menu */}
                            <DropdownMenu
                              open={openMenuId === inst.id}
                              onOpenChange={(open) => setOpenMenuId(open ? inst.id : null)}
                            >
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                  {openMenuId === inst.id
                                    ? <PanelTopClose className="h-4 w-4 text-muted-foreground" />
                                    : <PanelTopOpen className="h-4 w-4 text-muted-foreground" />}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>

                                {/* Edit — show for active and trail */}
                                {!isPending && (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(inst); }}>
                                    <Pencil className="h-4 w-4 me-2" />
                                    Edit Name
                                  </DropdownMenuItem>
                                )}

                                {/* Extend Trial — just for trail*/}
                                {isTrial && (
                                  <DropdownMenuItem
                                    onClick={(e) => { e.stopPropagation(); setShowExtendTrialConfirm(inst.id); }}
                                    disabled={!!extendTrialId}
                                  >
                                    {extendTrialId === inst.id
                                      ? <Loader2 className="h-4 w-4 me-2 animate-spin" />
                                      : <CalendarPlus className="h-4 w-4 me-2" />}
                                    Extend Trial
                                  </DropdownMenuItem>
                                )}

                                {/* Trash — just for payment pending*/}
                                {isPending && instances.length > 1 && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(inst.id); }}
                                    disabled={deletingId === inst.id}
                                  >
                                    {deletingId === inst.id
                                      ? <Loader2 className="h-4 w-4 me-2 animate-spin" />
                                      : <Trash2 className="h-4 w-4 me-2" />}
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>

                      {isPending && (
                        <TableRow className="bg-red-50 dark:bg-red-950/20">
                          <TableCell colSpan={5} className="py-2 px-6 text-sm text-red-600 dark:text-red-400 border-t border-red-100 dark:border-red-900">
                            Your instance has been Stopped due to non-payment. You can activate this instance by extending your subscription.
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {/* Dialogs */}
      <Dialog open={showCreateConfirm} onOpenChange={setShowCreateConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("create")}</DialogTitle>
            <DialogDescription>{t("createInstanceConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateConfirm(false)} disabled={creating}>
              {tCommon("actions.cancel")}
            </Button>
            <Button onClick={handleCreate} disabled={creating} className="gradient-primary text-primary-foreground">
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("actionsConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={creatingdia} onOpenChange={setCreatingdia}>
        <DialogContent className="bg-card max-w-md">
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">{t("progressLoadinTitle")}</p>
            <p className="text-sm text-muted-foreground mt-2 text-center">{t("progressLoadinSub")}</p>
            <div className="w-full bg-muted h-2 rounded mt-6 overflow-hidden">
              <div className="bg-primary h-2 w-3/4 animate-[loading_2.5s_linear_forwards]"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingInstance} onOpenChange={() => setEditingInstance(null)}>
        <DialogContent className="bg-card">
          <DialogHeader><DialogTitle>{tCommon("actions.edit")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("name")}</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={150} disabled={saving} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingInstance(null)} disabled={saving}>
              {tCommon("actions.cancel")}
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving || !editName.trim()} className="gradient-primary text-primary-foreground">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : tCommon("actions.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showExtendTrialConfirm} onOpenChange={() => setShowExtendTrialConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Trial</DialogTitle>
            <DialogDescription>Are you sure you want to extend the free trial for this instance?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendTrialConfirm(null)} disabled={!!extendTrialId}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground"
              onClick={async () => { if (showExtendTrialConfirm) await handleExtendTrial(showExtendTrialConfirm); }}
              disabled={!!extendTrialId}
            >
              {extendTrialId && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              Extend Trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteInstance")}</DialogTitle>
            <DialogDescription>{t("deleteInstanceMsg")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>{t("deleteInstanceCancel")}</Button>
            <Button variant="destructive" onClick={async () => { if (deleteConfirmId) await handleDelete(deleteConfirmId); }}>
              {t("deleteInstanceConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogDescription } from "@radix-ui/react-dialog";
import { CreditCard, Eye, Loader2, MoreHorizontal, Pencil, Plus, Search, Server, Trash2 } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import * as billingService from "@/features/billing/services/billing-service";
import * as instancesService from "../services/instances-service";
import type { Instance } from "../types";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  ACTIVE: "bg-success/10 text-success border-success/20",
  TRIAL: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  "PAYMENT_PENDING": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
};

function isActiveOrTrial(status: string) {
  return status === "ACTIVE" || status === "TRIAL" || status === "active";
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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [payingInstanceId, setPayingInstanceId] = useState<string | null>(null);
  const t = useTranslations("instances");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { selectInstance } = useAuth();

  const fetchInstances = useCallback(async () => {
    try {
      const data = await instancesService.getMyInstances();
      setInstances(data);
      console.log("Fetched instances:", data);
    } catch (err: any) {
      toast.error("Failed to load instances");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  const handleCreate = async () => {
    setShowCreateConfirm(false);
    setCreating(true);
    setCreatingdia(true);
    try {
      const isFirstInstance = instances.length === 0;
      const created = await instancesService.createInstance();

      if (isFirstInstance) {
        try {
          await selectInstance({ instanceId: created.id });
          const plans = await billingService.getPlans();
          const planId = plans[0]?.id;
          if (planId) {
            await billingService.startTrial(planId);
            toast.success("Trial started for your first instance");
          }
        } catch (err: unknown) {
          const message =
            (err as { message?: string })?.message ?? "Failed to start trial";
          toast.error(message);
        }
      }

      await fetchInstances();
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
    } catch (err: any) {
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
      if (err?.status === 403) {
        toast.error("Cannot delete: Instance is in PAYMENT_PENDING or permission denied");
      } else {
        toast.error("Failed to delete instance");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleActivatePay = async (instanceId: string) => {
    setPayingInstanceId(instanceId);
    try {
      // ensure instance-scoped token is active for this instance
      await selectInstance({ instanceId });
      const plans = await billingService.getPlans();
      const planId = plans[0]?.id;

      if (!planId) {
        toast.error("No billing plan available");
        return;
      }

      const result = await billingService.subscribe(planId);
      const checkoutUrl =
        (result as any)?.url ?? (result as any)?.checkoutUrl;

      if (!checkoutUrl) {
        toast.error("No checkout URL returned");
        return;
      }

      // redirect directly to Stripe (or configured gateway)
      window.location.href = checkoutUrl;
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? "Failed to start payment";
      toast.error(message);
    } finally {
      setPayingInstanceId(null);
    }
  };

  const filtered = instances.filter((inst) =>
    inst.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedInstances = [...filtered].sort((a, b) => {
    if (sortConfig.key === 'createdAt') {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
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
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {t("create")}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-9 bg-card"
        />
      </div>

      {/* Table */}
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
                  <TableHead
                    className="font-semibold cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    {t("creatDate")}{" "}
                    {sortConfig.key === "createdAt" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="font-semibold">{t("expireDate")}</TableHead>
                  <TableHead className="font-semibold">{t("status")}</TableHead>
                  {/* API Key column removed */}
                  <TableHead className="font-semibold text-end">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInstances.map((inst) => {
                  const active = isActiveOrTrial(inst.status);
                  return (
                    <TableRow
                      key={inst.id}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => router.push(`/${locale}/instances/${inst.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Server className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{inst.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(inst.createdAt).toLocaleDateString(locale)}
                      </TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusStyles[inst.status] ?? "bg-muted text-muted-foreground"}`}
                        >
                          {inst.status === "PAYMENT_PENDING"
                            ? "Payment Pending"
                            : inst.status}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          <Link href={`/${locale}/instances/${inst.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(inst);
                            }}
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          {!active && instances.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(inst.id);
                              }}
                              disabled={deletingId === inst.id}
                            >
                              {deletingId === inst.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          )}
                          {inst.status === "PAYMENT_PENDING" && (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-linear-to-r from-[#A78BFA] to-[#7C3AED] hover:from-[#9F7AEA] hover:to-[#6D28D9] text-white gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActivatePay(inst.id);
                              }}
                              disabled={!!payingInstanceId}
                            >
                              {payingInstanceId === inst.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CreditCard className="h-4 w-4" />
                              )}
                              {payingInstanceId === inst.id ? "Redirecting…" : "Pay"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Create Confirmation */}
      <Dialog open={showCreateConfirm} onOpenChange={setShowCreateConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("create")}</DialogTitle>
            <DialogDescription>{t("createInstanceConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateConfirm(false)}
              disabled={creating}
            >
              {tCommon("actions.cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="gradient-primary text-primary-foreground"
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("actionsConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Loading Dialog */}
      <Dialog open={creatingdia} onOpenChange={setCreatingdia}>
        <DialogContent className="bg-card max-w-md">
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">{t("progressLoadinTitle")}</p>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {t("progressLoadinSub")}
            </p>
            <div className="w-full bg-muted h-2 rounded mt-6 overflow-hidden">
              <div className="bg-primary h-2 w-3/4 animate-[loading_2.5s_linear_forwards]"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingInstance} onOpenChange={() => setEditingInstance(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>{tCommon("actions.edit")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("name")}</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={150}
                disabled={saving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditingInstance(null)}
              disabled={saving}
            >
              {tCommon("actions.cancel")}
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving || !editName.trim()}
              className="gradient-primary text-primary-foreground"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                tCommon("actions.save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteInstance")}</DialogTitle>
            <DialogDescription>{t("deleteInstanceMsg")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              {t("deleteInstanceCancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteConfirmId) return;
                await handleDelete(deleteConfirmId);
              }}
            >
              {t("deleteInstanceConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
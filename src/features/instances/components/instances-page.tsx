"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Search, Plus, Eye, Pencil, Trash2, Server, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { InstanceDetailModal } from "./instance-detail-modal";
import * as instancesService from "../services/instances-service";
import type { Instance } from "../types";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

function maskKey(key: string) {
  if (!key || key.length < 12) return key || "—";
  return key.slice(0, 12) + "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
}

export function InstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingInstance, setEditingInstance] = useState<Instance | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const t = useTranslations("instances");
  const tCommon = useTranslations("common");

  const fetchInstances = useCallback(async () => {
    try {
      const data = await instancesService.getMyInstances();
      setInstances(data);
    } catch {
      // Error handled by API client
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await instancesService.createInstance();
      await fetchInstances();
    } catch {
      // Error handled by API client
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (inst: Instance) => {
    setEditingInstance(inst);
    setEditName(inst.name);
  };

  const handleSaveEdit = async () => {
    if (!editingInstance) return;
    setSaving(true);
    try {
      await instancesService.updateInstance(editingInstance.id, { name: editName });
      setEditingInstance(null);
      await fetchInstances();
    } catch {
      // Error handled by API client
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await instancesService.deleteInstance(id);
      await fetchInstances();
    } catch {
      // Error handled by API client
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = instances.filter((inst) =>
    inst.name.toLowerCase().includes(search.toLowerCase())
  );

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
          onClick={handleCreate}
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
      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {instances.length === 0
              ? t("noInstances")
              : t("noResults")}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">{t("name")}</TableHead>
                  <TableHead className="font-semibold">{t("status")}</TableHead>
                  <TableHead className="font-semibold">{t("apiKey")}</TableHead>
                  <TableHead className="font-semibold">{t("created")}</TableHead>
                  <TableHead className="font-semibold text-end">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inst) => (
                  <TableRow key={inst.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Server className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{inst.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${statusStyles[inst.status] || ""}`}>
                        {inst.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        {maskKey(inst.apiKey)}
                      </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{inst.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedInstance(inst)}>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(inst)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={deletingId === inst.id}
                          onClick={() => handleDelete(inst.id)}
                        >
                          {deletingId === inst.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <InstanceDetailModal
        instance={selectedInstance}
        onClose={() => setSelectedInstance(null)}
        onRotated={fetchInstances}
      />

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
            <Button variant="ghost" onClick={() => setEditingInstance(null)} disabled={saving}>
              {tCommon("actions.cancel")}
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving || !editName.trim()}
              className="gradient-primary text-primary-foreground"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : tCommon("actions.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

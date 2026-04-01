"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent,
    DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getAdminInstances, updateAdminInstance } from "@/features/admin/services/admin-service";
import type { AdminInstance } from "@/features/admin/types";
import {
    Loader2,
    MoreHorizontal, Pencil,
    Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
    TRIAL: "bg-blue-100 text-blue-700 border-blue-200",
    SUSPENDED: "bg-red-100 text-red-700 border-red-200",
    PAYMENT_PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const STATUS_OPTIONS = ["ACTIVE", "SUSPENDED", "PAYMENT_PENDING"];

export default function AdminInstancesPage() {
    const [instances, setInstances] = useState<AdminInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [editing, setEditing] = useState<AdminInstance | null>(null);
    const [editName, setEditName] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [saving, setSaving] = useState(false);
    const limit = 20;

    const fetchInstances = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminInstances(page, limit);
            setInstances(res.items);
            setTotal(res.meta.total);
            setTotalPages(Math.ceil(res.meta.total / limit));
        } catch {
            toast.error("Failed to load instances");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchInstances(); }, [fetchInstances]);

    const filtered = instances.filter((inst) =>
        inst.name?.toLowerCase().includes(search.toLowerCase()) ||
        inst.id?.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (inst: AdminInstance) => {
        setEditing(inst);
        setEditName(inst.name);
        setEditStatus(inst.status);
    };

    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            await updateAdminInstance(editing.id, { name: editName, status: editStatus });
            toast.success("Instance updated");
            setEditing(null);
            await fetchInstances();
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? "Failed to update instance");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Instances</h1>
                <p className="text-sm text-muted-foreground mt-1">{total} total instances</p>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or ID..."
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Owner ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Trial</TableHead>
                                    <TableHead>Expires At</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-end">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                            No instances found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((inst, index) => (
                                        <TableRow key={inst.id}>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {(page - 1) * limit + index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium text-sm">{inst.name}</TableCell>
                                            <TableCell className="text-xs font-mono text-muted-foreground">
                                                {inst.ownerId?.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-xs ${statusStyles[inst.status] ?? "bg-muted text-muted-foreground"}`}>
                                                    {inst.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-xs ${inst.isTrialInstance ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-muted text-muted-foreground"}`}>
                                                    {inst.isTrialInstance ? "Trial" : "Paid"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDate(inst.expiresAt)}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDate(inst.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(inst)}>
                                                            <Pencil className="h-4 w-4 me-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                                Page {page} of {totalPages} • {total} instances
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Instance</DialogTitle>
                        <DialogDescription>Update instance name or status.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                disabled={saving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={editStatus} onValueChange={setEditStatus} disabled={saving}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving || !editName.trim()} className="gradient-primary text-primary-foreground">
                            {saving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
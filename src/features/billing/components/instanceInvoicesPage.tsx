"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getInvoices } from "@/features/billing/services/billing-service";
import { getInstance } from "@/features/instances/services/instances-service";
import { useAuth } from "@/features/auth/context/auth-context";
import type { Invoice } from "@/features/billing/types";
import { Download, ExternalLink, Loader2, FileText } from "lucide-react";
import { useEffect, useState } from "react";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch { return "—"; }
}
function getInvoiceAmount(inv: Invoice): string {
    if (inv.totalAmountUsd) return `$${parseFloat(inv.totalAmountUsd).toFixed(2)}`;
    if (inv.amount != null) return `${inv.currency?.toUpperCase() ?? ""} ${inv.amount}`;
    return "—";
}

function getInvoicePdf(inv: Invoice): string | undefined {
    return inv.invoicePdf || inv.pdfUrl;
}

const statusStyles: Record<string, string> = {
    paid: "bg-green-100 text-green-700 border-green-200",
    failed: "bg-red-100 text-red-700 border-red-200",
    open: "bg-blue-100 text-blue-700 border-blue-200",
    void: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function InstanceInvoicesPage({
    instanceId,
    locale,
}: {
    instanceId: string;
    locale: string;
}) {
    const { selectInstance } = useAuth();
    const [instanceName, setInstanceName] = useState<string>("");
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getInstance(instanceId)
            .then((inst) => setInstanceName(inst.name))
            .catch(() => setInstanceName(instanceId.slice(0, 8)));
    }, [instanceId]);

    useEffect(() => {
        const load = async () => {
            try {
                await selectInstance({ instanceId });
                const data = await getInvoices();
                setInvoices(Array.isArray(data) ? data : []);
            } catch {
                setInvoices([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [instanceId]);

    return (
        <div className="min-h-screen bg-background">
            <div className="p-6 max-w-7xl mx-auto space-y-6">

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/${locale}`}>Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/${locale}/instances`}>Instances</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/${locale}/instances/${instanceId}`}>
                                {instanceName || instanceId.slice(0, 8)}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Invoices</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div>
                    <h1 className="text-2xl font-bold mb-1 text-foreground">Invoices</h1>
                    <p className="text-sm text-muted-foreground">
                        {instanceName || instanceId.slice(0, 8)} —{" "}
                        <span className="text-sm font-medium text-white bg-linear-to-r from-[#A78BFA] to-[#7C3AED] px-1.5 py-0.5 rounded-sm">
                            {invoices.length}
                        </span>{" "}
                        <span className="text-lg font-semibold">Invoices</span>
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="bg-card rounded-xl border border-border p-16 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium">No invoices yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Invoices will appear here after your first payment.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="whitespace-nowrap w-10">#</TableHead>
                                    <TableHead className="whitespace-nowrap">Amount</TableHead>
                                    <TableHead className="whitespace-nowrap">Status</TableHead>
                                    <TableHead className="whitespace-nowrap">Plan</TableHead>
                                    <TableHead className="whitespace-nowrap">Interval</TableHead>
                                    <TableHead className="whitespace-nowrap">Paid at</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((inv, index) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-semibold text-sm">
                                            {getInvoiceAmount(inv)}
                                        </TableCell>
                                        {/* Status */}
                                        <TableCell>
                                            {inv.status ? (
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs capitalize ${statusStyles[inv.status.toLowerCase()] ?? "bg-muted text-muted-foreground"}`}
                                                >
                                                    {inv.status}
                                                </Badge>
                                            ) : "—"}
                                        </TableCell>
                                        {/* Plan */}
                                        <TableCell className="text-xs">
                                            {inv.metadata?.planCode ? (
                                                <Badge variant="outline" className="text-xs font-mono">
                                                    {inv.metadata.planCode}
                                                </Badge>
                                            ) : "—"}
                                        </TableCell>
                                        {/* Interval */}
                                        <TableCell className="text-xs text-muted-foreground">
                                            {inv.metadata?.interval ?? "—"}
                                        </TableCell>
                                        {/* Paid at */}
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDate(inv.paidAt)}
                                        </TableCell>
                                        <TableCell className="text-end">
                                            <div className="flex items-center justify-end gap-3">
                                                {getInvoicePdf(inv) && (
                                                    <a
                                                        href={getInvoicePdf(inv)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs text-[#7C3AED] hover:underline"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                        PDF
                                                    </a>
                                                )}
                                                {inv.hostedInvoiceUrl && (
                                                    <a
                                                        href={inv.hostedInvoiceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                        View
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
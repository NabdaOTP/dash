"use client";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMessages } from "@/features/messages/services/messages-service";
import type { Message, MessagesResponse } from "@/features/messages/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type TabValue = "all" | "queued" | "sent" | "invalid";


function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  } catch { return "—"; }
}

const statusColors: Record<string, string> = {
  sent: "bg-success/10 text-success border-success/20",
  queued: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  invalid: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function InstanceMessagesPage({
  instanceId,
  locale,
}: {
  instanceId: string;
  locale: string;
}) {
  const id = instanceId;
  const [tab, setTab] = useState<TabValue>("all");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const status = tab === "all" ? undefined : tab;
        const res: MessagesResponse = await getMessages({ status, page, limit });
        if (!cancelled) {
          setMessages(res.data);
          setTotal(res.total);
        }
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [tab, page, limit]);

  useEffect(() => { setPage(1); }, [tab]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="py-10 text-center text-sm text-muted-foreground">
          No messages found for this filter.
        </div>
      );
    }

    return (
      <>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="whitespace-nowrap w-10">#</TableHead>
                <TableHead className="whitespace-nowrap">To</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Body</TableHead>
                <TableHead className="whitespace-nowrap">Created at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((m, index) => (
                <TableRow key={m.id} className={
                  m.status === "sent" ? "bg-green-50/50 dark:bg-green-950/10" : ""
                }>
                  <TableCell className="text-xs text-muted-foreground">
                    {(page - 1) * limit + index + 1}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{m.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${statusColors[m.status] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {m.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs max-w-xs truncate">{m.message}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(m.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div>Page {page} of {totalPages} • {total} messages</div>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* ✅ Breadcrumb */}
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
              <BreadcrumbLink href={`/${locale}/instances/${id}`}>
                #{id?.slice(0, 8) ?? ""}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Messages</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-2xl font-bold mb-1 text-foreground">
            Messages
          </h1>
          <p className="text-sm text-muted-foreground">
            Instance #{id?.slice(0, 8) ?? ""} — <span className="text-sm font-medium text-white bg-linear-to-r from-[#A78BFA] to-[#7C3AED] hover:from-[#9F7AEA] px-1.5 py-0.5  rounded-sm">{total}</span> <span className="text-lg font-semibold">Messages</span>
          </p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
          <TabsList className="mb-4">
            <TabsTrigger className="data-[state=active]:bg-linear-to-r from-[#A78BFA] to-[#7C3AED] hover:from-[#9F7AEA]" value="all">All</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-linear-to-r from-[#A78BFA] to-[#7C3AED] hover:from-[#9F7AEA]" value="queued">Queued</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-linear-to-r from-[#A78BFA] to-[#7C3AED] hover:from-[#9F7AEA]" value="sent">Sent</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-linear-to-r from-[#A78BFA] to-[#7C3AED] hover:from-[#9F7AEA]" value="invalid">Invalid</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-0">{renderTable()}</TabsContent>
          <TabsContent value="queued" className="mt-0">{renderTable()}</TabsContent>
          <TabsContent value="sent" className="mt-0">{renderTable()}</TabsContent>
          <TabsContent value="invalid" className="mt-0">{renderTable()}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
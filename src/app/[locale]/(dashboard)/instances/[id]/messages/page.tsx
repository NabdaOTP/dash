// app/[locale]/(dashboard)/instances/[id]/messages/page.tsx
import InstanceMessagesPage from "@/features/messages/components/InstanceMessagesPage";

<<<<<<< HEAD
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  return <InstanceMessagesPage instanceId={id} locale={locale} />;
}
=======
import { Badge } from "@/components/ui/badge";
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
import { useParams } from "next/navigation";

type TabValue = "all" | "queued" | "sent" | "invalid";

export default function InstanceMessagesPage() {
  const params = useParams();
  const id = params.id as string;

  const [tab, setTab] = useState<TabValue>("all");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const status = tab === "all" ? undefined : tab;
        const res: MessagesResponse = await getMessages({
          status,
          page,
          limit,
        });
        if (!cancelled) {
          setMessages(res.data);
          setTotal(res.total);
          setLimit(res.limit);
        }
      } catch {
        if (!cancelled) {
          setMessages([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [tab, page, limit]);

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
                <TableHead className="whitespace-nowrap">ID</TableHead>
                <TableHead className="whitespace-nowrap">From</TableHead>
                <TableHead className="whitespace-nowrap">To</TableHead>
                <TableHead className="whitespace-nowrap">Ref</TableHead>
                <TableHead className="whitespace-nowrap">Type</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">ACK</TableHead>
                <TableHead className="whitespace-nowrap">Body</TableHead>
                <TableHead className="whitespace-nowrap">Priority</TableHead>
                <TableHead className="whitespace-nowrap">Created at</TableHead>
                <TableHead className="whitespace-nowrap">Sent at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs max-w-35 truncate">
                    {m.id}
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="font-mono text-xs">{m.phone}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {m.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="text-xs max-w-65 truncate">
                    {m.message}
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(m.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">-</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div>
            Page {page} of {totalPages} • {total} messages
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
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
        <div>
          <h1 className="text-2xl font-bold mb-2 text-foreground">
            Messages for Instance #{id?.slice(0, 8) ?? ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            View and filter messages sent through this instance.
          </p>
        </div>
        
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="queued">Queued</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="invalid">Invalid</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {renderTable()}
          </TabsContent>
          <TabsContent value="queued" className="mt-0">
            {renderTable()}
          </TabsContent>
          <TabsContent value="sent" className="mt-0">
            {renderTable()}
          </TabsContent>
          <TabsContent value="invalid" className="mt-0">
            {renderTable()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

>>>>>>> 9adf2ecd0c6b96ddc6c7f0d4b257fc63fa92f5a4

"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as messagesService from "../services/messages-service";
import type { Message } from "../types";

const statusStyles: Record<string, string> = {
  queued: "bg-warning/10 text-warning border-warning/20",
  sent: "bg-success/10 text-success border-success/20",
  invalid: "bg-destructive/10 text-destructive border-destructive/20",
};

const LIMIT = 20;

export function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const t = useTranslations("messages");

  const totalPages = Math.ceil(total / LIMIT) || 1;

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await messagesService.getMessages({
        status: statusFilter || undefined,
        page,
        limit: LIMIT,
      });
      setMessages(res.data);
      setTotal(res.total);
    } catch {
      // Error handled by API client
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filters = [
    { key: "", label: t("filterAll") },
    { key: "queued", label: t("filterQueued") },
    { key: "sent", label: t("filterSent") },
    { key: "invalid", label: t("filterInvalid") },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={statusFilter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setStatusFilter(f.key);
              setPage(1);
            }}
            className={
              statusFilter === f.key
                ? "gradient-primary text-primary-foreground"
                : ""
            }
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t("noMessages")}</p>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">{t("phone")}</TableHead>
                    <TableHead className="font-semibold">{t("message")}</TableHead>
                    <TableHead className="font-semibold">{t("status")}</TableHead>
                    <TableHead className="font-semibold">{t("date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((msg) => (
                    <TableRow key={msg.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-mono text-sm">{msg.phone}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {msg.message}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusStyles[msg.status] || ""}`}
                        >
                          {msg.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {msg.createdAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("page", { current: page, total: totalPages })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                {t("previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

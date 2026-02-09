"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Plus, Eye, Pencil, Trash2, Server } from "lucide-react";
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
import { InstanceDetailModal } from "./instance-detail-modal";
import type { Instance } from "../types";

// Mock data — will be replaced by service calls
const mockInstances: Instance[] = [
  {
    id: "1",
    name: "Production OTP",
    status: "active",
    apiKey: "ndb_live_sk_7f8a9b2c3d4e5f6g",
    token: "tok_live_abc123def456",
    apiId: "api_prod_001",
    createdAt: "2025-01-15",
    otpSent: 12500,
    otpVerified: 12300,
  },
  {
    id: "2",
    name: "Staging Environment",
    status: "active",
    apiKey: "ndb_test_sk_1a2b3c4d5e6f7g8h",
    token: "tok_test_xyz789ghi012",
    apiId: "api_stg_002",
    createdAt: "2025-02-01",
    otpSent: 450,
    otpVerified: 440,
  },
  {
    id: "3",
    name: "Mobile App",
    status: "inactive",
    apiKey: "ndb_live_sk_9h8g7f6e5d4c3b2a",
    token: "tok_live_mno345pqr678",
    apiId: "api_mob_003",
    createdAt: "2025-01-28",
    otpSent: 8200,
    otpVerified: 8100,
  },
  {
    id: "4",
    name: "Legacy System",
    status: "error",
    apiKey: "ndb_live_sk_0z9y8x7w6v5u4t3s",
    token: "tok_live_stu901vwx234",
    apiId: "api_leg_004",
    createdAt: "2024-11-20",
    otpSent: 3200,
    otpVerified: 2900,
  },
];

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

function maskKey(key: string) {
  return key.slice(0, 12) + "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
}

export function InstancesPage() {
  const [search, setSearch] = useState("");
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);
  const t = useTranslations("instances");

  const filtered = mockInstances.filter((inst) =>
    inst.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button className="gradient-primary text-primary-foreground gap-2 shrink-0">
          <Plus className="h-4 w-4" />
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
                    <Badge variant="outline" className={`text-xs ${statusStyles[inst.status]}`}>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <InstanceDetailModal
        instance={selectedInstance}
        onClose={() => setSelectedInstance(null)}
      />
    </div>
  );
}

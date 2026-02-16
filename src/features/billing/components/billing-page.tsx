"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { CreditCard, FileText, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as billingService from "../services/billing-service";
import type { Plan, Invoice } from "../types";

export function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [autoRenew, setAutoRenew] = useState(false);
  const [togglingAutoRenew, setTogglingAutoRenew] = useState(false);
  const t = useTranslations("billing");

  useEffect(() => {
    async function fetchData() {
      try {
        const [plansData, invoicesData] = await Promise.allSettled([
          billingService.getPlans(),
          billingService.getInvoices(),
        ]);
        if (plansData.status === "fulfilled") {
          const result = plansData.value;
          setPlans(Array.isArray(result) ? result : [result]);
        }
        if (invoicesData.status === "fulfilled") {
          setInvoices(
            Array.isArray(invoicesData.value) ? invoicesData.value : []
          );
        }
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    try {
      await billingService.subscribe(planId);
    } catch {
      // handled
    } finally {
      setSubscribing(null);
    }
  };

  const handleStartTrial = async (planId: string) => {
    setSubscribing(planId);
    try {
      await billingService.startTrial(planId);
    } catch {
      // handled
    } finally {
      setSubscribing(null);
    }
  };

  const handleToggleAutoRenew = async () => {
    setTogglingAutoRenew(true);
    try {
      await billingService.setAutoRenew(!autoRenew);
      setAutoRenew(!autoRenew);
    } catch {
      // handled
    } finally {
      setTogglingAutoRenew(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Plans */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          {t("plans.title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-card rounded-xl border border-border p-6 space-y-4"
            >
              <div>
                <h3 className="font-semibold text-foreground text-lg">{plan.name}</h3>
                <p className="text-2xl font-bold text-primary mt-1">
                  {plan.price > 0 ? `$${plan.price}` : t("plans.free")}
                </p>
              </div>
              {plan.features && (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-success mt-0.5">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id}
                  className="flex-1 gradient-primary text-primary-foreground"
                  size="sm"
                >
                  {subscribing === plan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("plans.subscribe")
                  )}
                </Button>
                <Button
                  onClick={() => handleStartTrial(plan.id)}
                  disabled={subscribing === plan.id}
                  variant="outline"
                  size="sm"
                >
                  {t("plans.startTrial")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Auto-Renewal */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {autoRenew ? (
              <ToggleRight className="h-6 w-6 text-success" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-muted-foreground" />
            )}
            <div>
              <h3 className="font-semibold text-foreground">{t("subscription.autoRenew")}</h3>
              <p className="text-sm text-muted-foreground">
                {autoRenew
                  ? t("subscription.autoRenewOn")
                  : t("subscription.autoRenewOff")}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleAutoRenew}
            disabled={togglingAutoRenew}
          >
            {togglingAutoRenew ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : autoRenew ? (
              t("subscription.disable")
            ) : (
              t("subscription.enable")
            )}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Invoices */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {t("invoices.title")}
        </h2>

        {invoices.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">{t("invoices.noInvoices")}</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">{t("invoices.amount")}</TableHead>
                  <TableHead className="font-semibold">{t("invoices.status")}</TableHead>
                  <TableHead className="font-semibold">{t("invoices.date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      {inv.currency} {inv.amount}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {inv.createdAt}
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

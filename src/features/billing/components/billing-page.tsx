"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CreditCard,
  FileText,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Download,
  CalendarClock,
  CheckCircle2,
  Server,
} from "lucide-react";
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
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import * as billingService from "../services/billing-service";
import type { Plan, Invoice } from "../types";

export function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  // Separate loading states per action
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null);
  const [trialPlanId, setTrialPlanId] = useState<string | null>(null);
  const [extendingTrial, setExtendingTrial] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);
  const [togglingAutoRenew, setTogglingAutoRenew] = useState(false);
  // Track successful actions for visual feedback
  const [subscribedPlanId, setSubscribedPlanId] = useState<string | null>(null);
  const [trialActivePlanId, setTrialActivePlanId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";
  const successPlanId = searchParams.get("planId");
  const t = useTranslations("billing");

  useEffect(() => {
    async function fetchData() {
      try {
        const [plansData, invoicesData] = await Promise.allSettled([
          billingService.getPlans(),
          billingService.getInvoices(),
        ]);
        if (plansData.status === "fulfilled") setPlans(plansData.value);
        if (invoicesData.status === "fulfilled") {
          setInvoices(
            Array.isArray(invoicesData.value) ? invoicesData.value : []
          );
        }
      } catch {
        // handled by API client
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubscribe = async (planId: string) => {
    setSubscribingPlanId(planId);
    try {
      const result = await billingService.subscribe(planId);
      const url = result?.url ?? result?.checkoutUrl;
      if (url) {
        window.location.href = url;
        return;
      }
      setSubscribedPlanId(planId);
      setTrialActivePlanId(null);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? "Failed to start checkout";
      toast.error(message);
    } finally {
      setSubscribingPlanId((prev) => (prev === planId ? null : prev));
    }
  };

  const handleStartTrial = async (planId: string) => {
    setTrialPlanId(planId);
    try {
      const result = await billingService.startTrial(planId);
      const url = result?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      setTrialActivePlanId(planId);
      setSubscribedPlanId(null);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? "Failed to start trial";
      toast.error(message);
    } finally {
      setTrialPlanId((prev) => (prev === planId ? null : prev));
    }
  };

  const handleExtendTrial = async () => {
    setExtendingTrial(true);
    try {
      await billingService.extendTrial();
      toast.success(t("subscription.extendTrial"));
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? "Failed to extend trial";
      toast.error(message);
    } finally {
      setExtendingTrial(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    setTogglingAutoRenew(true);
    try {
      await billingService.setAutoRenew(!autoRenew);
      setAutoRenew(!autoRenew);
      toast.success(autoRenew ? t("subscription.disable") : t("subscription.enable"));
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? "Failed to update auto-renewal";
      toast.error(message);
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

  const successPlan = successPlanId && plans.length > 0 ? plans.find((p) => p.id === successPlanId) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      {/* Payment success banner when redirected from Stripe */}
      {paymentSuccess && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-success/20 p-2 shrink-0">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{t("checkout.success")}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{t("checkout.successDesc")}</p>
              {successPlan && (
                <div className="mt-3 text-sm">
                  <p className="font-medium text-foreground">{successPlan.name}</p>
                  <p className="text-muted-foreground">
                    {successPlan.price != null && successPlan.price > 0
                      ? `$${successPlan.price}/month`
                      : t("plans.free")}
                  </p>
                  {successPlan.features?.length > 0 && (
                    <ul className="mt-1 list-disc list-inside text-muted-foreground">
                      {successPlan.features.slice(0, 3).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
          <Button asChild className="gradient-primary text-primary-foreground shrink-0">
            <Link href="/instances">
              <Server className="h-4 w-4 me-2" />
              Go to Instances
            </Link>
          </Button>
        </div>
      )}

      {/* Plans */}
      {plans.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {t("plans.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isSubscribed = subscribedPlanId === plan.id;
              const isTrialActive = trialActivePlanId === plan.id;
              const isSubscribing = subscribingPlanId === plan.id;
              const isStartingTrial = trialPlanId === plan.id;
              const isBusy = isSubscribing || isStartingTrial;

              return (
                <div
                  key={plan.id}
                  className={`bg-card rounded-xl border p-6 space-y-4 transition-colors ${
                    isSubscribed || isTrialActive
                      ? "border-primary/40 bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">
                        {plan.name ?? t("plans.title")}
                      </h3>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {plan.price != null
                          ? plan.price > 0
                            ? `$${plan.price}`
                            : t("plans.free")
                          : "—"}
                      </p>
                    </div>
                    {isSubscribed && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 shrink-0">
                        <CheckCircle2 className="h-3 w-3 me-1" />
                        {t("plans.subscribed")}
                      </Badge>
                    )}
                    {isTrialActive && (
                      <Badge className="bg-success/10 text-success border-success/20 shrink-0">
                        <CheckCircle2 className="h-3 w-3 me-1" />
                        {t("plans.trialStarted")}
                      </Badge>
                    )}
                  </div>

                  {plan.features && plan.features.length > 0 && (
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
                      disabled={isBusy || isSubscribed}
                      className="flex-1 gradient-primary text-primary-foreground"
                      size="sm"
                    >
                      {isSubscribing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin me-1.5" />
                          {t("checkout.redirecting")}
                        </>
                      ) : (
                        t("plans.subscribe")
                      )}
                    </Button>
                    <Button
                      onClick={() => handleStartTrial(plan.id)}
                      disabled={isBusy || isTrialActive}
                      variant="outline"
                      size="sm"
                    >
                      {isStartingTrial ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin me-1.5" />
                          {t("plans.startingTrial")}
                        </>
                      ) : (
                        t("plans.startTrial")
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      {/* Subscription Management */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          {t("subscription.title")}
        </h2>

        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {/* Auto-Renewal */}
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              {autoRenew ? (
                <ToggleRight className="h-6 w-6 text-success shrink-0" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-muted-foreground shrink-0" />
              )}
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  {t("subscription.autoRenew")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
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

          {/* Extend Trial */}
          <div className="flex items-center justify-between p-5">
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                {t("subscription.extendTrial")}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("subscription.extendTrialDesc")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExtendTrial}
              disabled={extendingTrial}
            >
              {extendingTrial ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin me-1.5" />
                  {t("subscription.extendingTrial")}
                </>
              ) : (
                t("subscription.extendTrial")
              )}
            </Button>
          </div>
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
                  <TableHead />
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
                    <TableCell className="text-end">
                      {inv.pdfUrl && (
                        <a
                          href={inv.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {t("invoices.download")}
                        </a>
                      )}
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

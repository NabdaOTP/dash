"use client";

// TODO: when backend is ready, add to imports:
// import { useSearchParams } from "next/navigation";
// import { connect } from "@/features/whatsapp/services/whatsapp-service";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/context/auth-context";
import { getInstance, rotateApiKey } from "@/features/instances/services/instances-service";
import type { Instance } from "@/features/instances/types";
import { WhatsAppSection } from "@/features/whatsapp/components/WhatsAppSection";
import { disconnect, restart } from "@/features/whatsapp/services/whatsapp-service";
import { ApiError } from "@/lib/api-client";
import {
  ArrowRightLeft,
  BookText,
  Check,
  Copy,
  DoorClosedLocked,
  Loader2,
  LogOut,
  MessageCircle,
  RefreshCw,
  RotateCw,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getAutoRenew, setAutoRenew } from "@/features/billing/services/billing-service";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { connect } from "@/features/whatsapp/services/whatsapp-service";
import { Wifi } from "lucide-react";
export function InstanceDetailView({id,locale,}: {id: string;locale: string;}) {
  const { selectInstance } = useAuth();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showRotateDialog, setShowRotateDialog] = useState(false);
  const [rotatingToken, setRotatingToken] = useState(false);
  const [whatsAppAction, setWhatsAppAction] = useState<"disconnect" | "restart" | "change" | null>(null);
  const [autoRenew, setAutoRenewState] = useState(false);
  const [autoRenewLoading, setAutoRenewLoading] = useState(false);
  const [connectingWa, setConnectingWa] = useState(false);

 const loadInstance = useCallback(async () => {
  if (!id) return;
  setLoading(true);
  setPaymentRequired(false);
  try {
    await selectInstance({ instanceId: id });
    const data = await getInstance(id);
    setInstance(data);
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      setPaymentRequired(true);
    } else {
      notFound();
    }
  } finally {
    setLoading(false);
    // silent connect after loading the instance
    try {
      await connect();
    } catch {
      // silent
    }
  }
}, [id, selectInstance]);

  const handleCopy = async (value: string, field: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleRotateToken = async () => {
    if (!instance) return;
    setRotatingToken(true);
    try {
      const result = await rotateApiKey();
      setInstance((prev) =>
        prev ? { ...prev, apiKey: result.apiKey } : prev,
      );
      toast.success("Token rotated successfully");
      setShowRotateDialog(false);
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? "Failed to rotate token";
      toast.error(message);
    } finally {
      setRotatingToken(false);
    }
  };

  // const handleConnectWhatsApp = async () => {
  //   setConnectingWa(true);
  //   try {
  //     await connect();
  //     toast.success("WhatsApp connecting... QR code will appear below.");
  //   } catch (err: unknown) {
  //     const msg = (err as { message?: string })?.message ?? "";
  //     if (msg.toLowerCase().includes("timed out") || msg.toLowerCase().includes("timeout")) {
  //       toast.info("WhatsApp is starting up. Check the section below.");
  //     } else {
  //       toast.error(msg || "Failed to connect WhatsApp");
  //     }
  //   } finally {
  //     setConnectingWa(false);
  //   }
  // };

  const handleWhatsAppDisconnect = async (reason: "logout" | "change") => {
    setWhatsAppAction(reason === "logout" ? "disconnect" : "change");
    try {
      await disconnect();
      toast.success(
        reason === "logout"
          ? "WhatsApp disconnected"
          : "WhatsApp disconnected. Scan QR to connect a new number.",
      );
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? "Failed to disconnect";
      toast.error(message);
    } finally {
      setWhatsAppAction(null);
    }
  };

  const handleAutoRenewChange = async (checked: boolean) => {
    setAutoRenewLoading(true);
    const prev = autoRenew;
    setAutoRenewState(checked);
    try {
      await setAutoRenew(checked);
      toast.success("Auto-renew updated");
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? "Failed to update auto-renew";
      toast.error(message);
      setAutoRenewState(prev);
    } finally {
      setAutoRenewLoading(false);
    }
  };

  const handleWhatsAppRestart = async () => {
    setWhatsAppAction("restart");
    try {
      await restart();
      toast.success("WhatsApp restart requested");
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? "Failed to restart WhatsApp";
      toast.error(message);
    } finally {
      setWhatsAppAction(null);
    }
  };
// TODO: when backend is ready, add:
  // useEffect(() => {
//   if (!paymentSuccess || !instance || loading) return;
//
//   const autoConnectAfterPayment = async () => {
//     try {
//       await connect();
//       toast.success("WhatsApp connecting after payment...");
//     } catch {
//       // silent — user connects manually
//     }
//   };
//
//   autoConnectAfterPayment();
// }, [paymentSuccess, instance, loading]);

  useEffect(() => {
    loadInstance();
  }, [loadInstance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (paymentRequired) {
    return (
      <div className="p-12 text-center max-w-2xl mx-auto">
        <div className="text-6xl mb-6"><DoorClosedLocked /></div>
        <h2 className="text-3xl font-bold">Payment Required</h2>
        <p className="mt-3 text-muted-foreground">
          Complete payment to activate this instance and scan QR code.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href={`/${locale}/billing/subscribe?instanceId=${id}`}>
            Pay $10/month Now
          </Link>
        </Button>
      </div>
    );
  }

  if (!instance) return null;

  const apiUrl = `https://api.nabdaotp.com/inst/${id}`;
  const tokenValue = instance.apiKey || instance.token || "";

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${locale}`}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${locale}/instances`}>
                  Instances
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>#{id.slice(0, 8)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="border-b bg-card px-4 sm:px-6 py-4 space-y-4">
          {/* Top Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="text-lg sm:text-2xl font-semibold break-all">
                Instance #{id.slice(0, 8)}
              </span>
              <span className="text-muted-foreground text-sm sm:text-base">
                {instance.name || "Unnamed"}
              </span>
            </div>
          </div>
          {/* Actions */}
          <div className="grid grid-cols-2 ms-auto w-fit sm:flex sm:flex-wrap gap-2">
            <Link href={`/${locale}/api-docs`} className="w-full sm:w-auto">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                <BookText className="h-4 w-4 mr-1" />
                API Docs
              </Button>
            </Link>
            <Link
              href={`/${locale}/instances/${id}/messages`}
              className="w-full sm:w-auto"
            >
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                <MessageCircle className="h-4 w-4 mr-1" />
                Messages
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto text-destructive"
              onClick={() => handleWhatsAppDisconnect("logout")}
              disabled={whatsAppAction === "disconnect"}
            >
              {whatsAppAction === "disconnect" ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-1" />
              )}
              Log out
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => handleWhatsAppDisconnect("change")}
              disabled={whatsAppAction === "change"}
            >
              {whatsAppAction === "change" ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ArrowRightLeft className="h-4 w-4 mr-1" />
              )}
              Change WA Number
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto"
              onClick={handleWhatsAppRestart}
              disabled={whatsAppAction === "restart"}
            >
              {whatsAppAction === "restart" ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RotateCw className="h-4 w-4 mr-1" />
              )}
              Restart
            </Button>
          </div>
        </div>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Credentials Card - UltraMsg-style Table */}
          <Card className="overflow-hidden border border-border shadow-sm">
            <CardHeader className="bg-muted/30 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Credentials</CardTitle>
                {/* ✅ Connect WhatsApp button */}
                {/* <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white"
                  onClick={handleConnectWhatsApp}
                  disabled={connectingWa}
                >
                  {connectingWa
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Wifi className="h-4 w-4" />}
                  {connectingWa ? "Connecting..." : "Connect WhatsApp"}
                </Button> */}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full table-fixed">
                {/* Header Row */}
                <thead>
                  <tr className=" border-b bg-[#ede9fe]   border-[#c4b5fd]">
                    <th className="text-left text-sm font-medium text-[#5b21b6] px-4 py-3 w-40">
                      Auth Status
                    </th>
                    <th className="text-left text-sm font-medium text-[#5b21b6] px-4 py-3">
                      API URL
                    </th>
                    <th className="text-left text-sm font-medium text-[#5b21b6] px-4 py-3">
                      Instance ID
                    </th>
                    <th className="text-left text-sm font-medium text-[#5b21b6] px-4 py-3">
                      Token
                    </th>
                  </tr>
                </thead>
                {/* Data Row */}
                <tbody>
                  <tr className="bg-[#faf5ff]">
                    {/* Auth Status */}
                    <td className="px-4 py-4">
                      <Badge
                        className={
                          instance.status === "ACTIVE" || instance.status === "active"
                            ? "bg-[#16a34a] hover:bg-[#15803d] text-white border-0 text-xs font-semibold"
                            : instance.status === "TRIAL"
                              ? "bg-blue-500 hover:bg-blue-600 text-white border-0 text-xs font-semibold"
                              : instance.status === "PAYMENT_PENDING"
                                ? "bg-yellow-500 hover:bg-yellow-600 text-white border-0 text-xs font-semibold"
                                : "bg-red-500 hover:bg-red-600 text-white border-0 text-xs font-semibold"
                        }
                      >
                        {instance.status === "ACTIVE" || instance.status === "active"
                          ? "Authenticated"
                          : instance.status === "TRIAL"
                            ? "Trial"
                            : instance.status === "PAYMENT_PENDING"
                              ? "Payment Pending"
                              : instance.status === "inactive"
                                ? "Inactive"
                                : "Error"}
                      </Badge>
                    </td>

                    {/* API URL */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={apiUrl}
                          className="text-sm font-mono bg-white border border-[#d1d5db] rounded-md px-3 py-1.5 w-full truncate focus:outline-none text-gray-700 cursor-default"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 text-gray-500 hover:text-gray-700"
                          onClick={() => handleCopy(apiUrl, "apiUrl")}
                        >
                          {copiedField === "apiUrl"
                            ? <Check className="h-4 w-4 text-green-600" />
                            : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </td>

                    {/* Instance ID */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={id}
                          className="text-sm font-mono bg-white border border-[#d1d5db] rounded-md px-3 py-1.5 w-full truncate focus:outline-none text-gray-700 cursor-default"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 text-gray-500 hover:text-gray-700"
                          onClick={() => handleCopy(id, "instanceId")}
                        >
                          {copiedField === "instanceId"
                            ? <Check className="h-4 w-4 text-green-600" />
                            : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </td>

                    {/* Token */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={instance.apiKey}
                          className="text-sm font-mono bg-white border border-[#d1d5db] rounded-md px-3 py-1.5 w-full truncate focus:outline-none text-gray-700 cursor-default"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 text-gray-500 hover:text-gray-700"
                          onClick={() => handleCopy(tokenValue, "token")}
                        >
                          {copiedField === "token"
                            ? <Check className="h-4 w-4 text-green-600" />
                            : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowRotateDialog(true)}
                          title="Rotate token"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
          <div className="mt-8">
            {/* <WhatsAppSection instanceId={id} /> */}
            {instance && (
              <WhatsAppSection
                key={instance.id}
                instanceId={id}
                locale={locale}
              />
            )}
          </div>
          {instance.status === "ACTIVE" || instance.status === "TRIAL" && <>
            <Card className="mt-6 overflow-hidden border border-border shadow-sm">
              <CardHeader className="bg-purple-100/30 py-4 pt-6">
                <CardTitle className="text-base font-semibold">Subscription Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Auto-renew subscription</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Automatically renew your subscription when it expires
                    </p>
                  </div>
                  <Switch
                    checked={autoRenew}
                    onCheckedChange={handleAutoRenewChange}
                    disabled={autoRenewLoading}
                  />
                  {autoRenewLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          </>}
        </div>
      </div>
      <Dialog open={showRotateDialog} onOpenChange={setShowRotateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rotate Token</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            Are you sure you want to rotate the token?
          </p>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowRotateDialog(false)}
              disabled={rotatingToken}
            >
              Cancel
            </Button>
            <Button className="bg-linear-to-r from-[#A78BFA] to-[#7C3AED] hover:from-[#9F7AEA] hover:to-[#6D28D9] text-white" onClick={handleRotateToken} disabled={rotatingToken}>
              {rotatingToken ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Rotate Token"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

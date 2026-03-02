"use client";

import { QRCodeDisplay } from "@/components/qr-code-display";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/context/auth-context";
import { getInstance, rotateApiKey } from "@/features/instances/services/instances-service";
import type { Instance } from "@/features/instances/types";
import { WhatsAppSection } from "@/features/whatsapp/components/WhatsAppSection";
import { disconnect, restart } from "@/features/whatsapp/services/whatsapp-service";
import { sendMessage } from "@/features/messages/services/messages-service";
import { ApiError } from "@/lib/api-client";
import {
  ArrowRightLeft,
  BookText,
  Bot,
  Brush,
  Check,
  Copy,
  DoorClosedLocked,
  Loader2,
  LogOut,
  MessageCircle,
  RefreshCw,
  RotateCw,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { notFound } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import whatsApp from "../../../../public/whatsapp.svg";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOtp } from "../hooks/useOtp";

export function InstanceDetailView({
  id,
  locale,
}: {
  id: string;
  locale: string;
}) {
  const { selectInstance } = useAuth();
  const {
    phone: otpPhone,
    setPhone: setOtpPhone,
    code: otpCode,
    setCode: setOtpCode,
    otpSent,
    isSending: sendingOtp,
    isVerifying: verifyingOtp,
    sendOtp,
    verifyOtp,
  } = useOtp();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showRotateDialog, setShowRotateDialog] = useState(false);
  const [rotatingToken, setRotatingToken] = useState(false);
  const [whatsAppAction, setWhatsAppAction] = useState<"disconnect" | "restart" | "change" | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messagePhone, setMessagePhone] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

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

  const handleSendMessage = async () => {
    if (!messagePhone.trim() || !messagePhone.trim().startsWith("+")) {
      toast.error("Phone number must start with + and include country code");
      return;
    }
    if (!messageBody.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    setSendingMessage(true);
    try {
      await sendMessage({
        phone: messagePhone.trim(),
        message: messageBody.trim(),
      });
      toast.success("Message sent successfully");
      setShowMessageDialog(false);
      setMessagePhone("");
      setMessageBody("");
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? "Failed to send message";
      toast.error(message);
    } finally {
      setSendingMessage(false);
    }
  };

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
            {/* <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              <Wrench className="h-4 w-4 mr-1" />
              Troubleshoot
            </Button> */}
            {/* <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              <MessageCircle className="h-4 w-4 mr-1" />
              Messages
            </Button> */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setShowMessageDialog(true)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Messages
            </Button>
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
          <Card className="overflow-hidden border-none shadow-sm">
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow>
                  <TableHead className="w-1/4 font-medium text-muted-foreground">
                    AUTH STATUS
                  </TableHead>
                  <TableHead className="w-1/4 font-medium text-muted-foreground">
                    API URL
                  </TableHead>
                  <TableHead className="w-1/4 font-medium text-muted-foreground">
                    INSTANCE ID
                  </TableHead>
                  <TableHead className="w-1/4 font-medium text-muted-foreground">
                    TOKEN
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-linear-to-r from-purple-50 to-purple-50/50 hover:bg-purple-50/70 transition-colors">
                  <TableCell className="font-medium">
                    <Badge
                      variant="outline"
                      className="bg-white text-purple-700 border-purple-300 hover:bg-purple-50"
                    >
                      Scan QR code
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-purple-800 bg-purple-50 px-2 py-1 rounded">
                        {apiUrl}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleCopy(apiUrl, "apiUrl")}
                      >
                        {copiedField === "apiUrl" ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono">{id}</code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleCopy(id, "instanceId")}
                      >
                        {copiedField === "instanceId" ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-purple-800">
                        ••••••••
                        {instance.apiKey?.slice(-8) ||
                          instance.token?.slice(-8) ||
                          "—"}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleCopy(tokenValue, "token")}
                      >
                        {copiedField === "token" ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setShowRotateDialog(true)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
          <div className="mt-8">
            <WhatsAppSection instanceId={id} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 my-3">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg pt-6 sm:text-xl">
                  Connect Your WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <ol className="list-decimal pl-5 space-y-3 text-sm sm:text-base text-muted-foreground">
                  <li>Open WhatsApp on your phone</li>
                  <li>Go to Settings → Linked Devices</li>
                  <li>Tap &quot;Link a Device&quot;</li>
                  <li>Scan the QR code on the right</li>
                </ol>
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <QRCodeDisplay size={280} label="Scan with WhatsApp" />
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh QR Code (expires
                  in 45s)
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-linear-to-br from-green-950 to-black border-green-800/30 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-md">
                    <Image
                      src={whatsApp}
                      width={50}
                      height={50}
                      alt="WhatsApp logo"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-white">WhatsApp</p>
                    <p className="text-xs text-green-400">
                      Online • Scanning...
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-2 flex flex-col items-center justify-center min-h-95">
                <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
                  <QRCodeDisplay size={220} />
                </div>
                <p className="text-xs text-green-300 mt-6 opacity-80">
                  Scan this code with your phone to link the device
                </p>
              </CardContent>
            </Card>
            {/* OTP Service */}
            <div className="mt-8">
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle className="text-lg sm:text-xl">OTP Service</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="otp-phone">Phone number</Label>
                    <Input
                      id="otp-phone"
                      placeholder="+20123456789"
                      value={otpPhone}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setOtpPhone(e.target.value)
                      }
                      disabled={sendingOtp || verifyingOtp}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must start with + and include country code.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={sendOtp}
                      disabled={sendingOtp || verifyingOtp}
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp-code">OTP Code</Label>
                    <Input
                      id="otp-code"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setOtpCode(e.target.value)
                      }
                      maxLength={6}
                      disabled={!otpSent || verifyingOtp}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-digit code received on WhatsApp.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={verifyOtp}
                      disabled={!otpSent || verifyingOtp}
                    >
                      {verifyingOtp ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>
      <Dialog open={showRotateDialog} onOpenChange={setShowRotateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rotate Token</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            Are you sure you want to rotate the token? This will invalidate the
            existing token and generate a new one.
          </p>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowRotateDialog(false)}
              disabled={rotatingToken}
            >
              Cancel
            </Button>
            <Button className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white" onClick={handleRotateToken} disabled={rotatingToken}>
              {rotatingToken ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Rotate Token"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send WhatsApp Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Phone number</label>
              <Input
                placeholder="+201012345678"
                value={messagePhone}
                onChange={(e) => setMessagePhone(e.target.value)}
                disabled={sendingMessage}
              />
              <p className="text-xs text-muted-foreground">
                Must start with + and include country code.
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Your code is 123456"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                rows={4}
                disabled={sendingMessage}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowMessageDialog(false)}
              disabled={sendingMessage}
            >
              Cancel
            </Button>
            <Button className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white" onClick={handleSendMessage} disabled={sendingMessage}>
              {sendingMessage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

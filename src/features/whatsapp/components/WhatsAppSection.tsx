"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { RefreshCw, Send, Loader2 } from "lucide-react";
import { getQrCode, getStatus, connect, disconnect, restart } from "../services/whatsapp-service";
import { sendMessage } from "@/features/messages/services/messages-service";
import { getInstance } from "@/features/instances/services/instances-service";
import type { WhatsAppStatus } from "../types";
import { toast } from "sonner";

interface WhatsAppSectionProps {
  instanceId: string;
  locale?: string;
}

function normalizeStatus(status: string): string {
  return status?.toLowerCase() ?? "";
}

function WhatsAppSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            <Skeleton className="w-48 h-48 rounded-lg" />
          </div>
          <div className="space-y-2">
            {[75, 80, 85, 90].map((w) => (
              <Skeleton key={w} className="h-4 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-24 rounded" />
            <Skeleton className="h-9 w-28 rounded" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <Skeleton className="h-6 w-44" />
        </div>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-32 rounded-full" />
          <div className="flex gap-3">
            <Skeleton className="h-9 w-28 rounded" />
            <Skeleton className="h-9 w-24 rounded" />
            <Skeleton className="h-9 w-24 rounded" />
          </div>
          <div className="border-t pt-6 space-y-4">
            <Skeleton className="h-5 w-28 rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-24 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function WhatsAppSection({ instanceId, locale = "en" }: WhatsAppSectionProps) {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; is401?: boolean } | null>(null);
  const [sendPhone, setSendPhone] = useState("");
  const [sendText, setSendText] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshingQr, setRefreshingQr] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      setError(null);

      const [stat, inst] = await Promise.allSettled([
        getStatus(),
        getInstance(instanceId),
      ]);

      if (stat.status === "fulfilled") {
        setStatus(stat.value);
        if (stat.value.qr) {
          setQr(stat.value.qr);
        } else {
          const normalized = normalizeStatus(stat.value.status);
          if (normalized === "qr_ready" || normalized === "disconnected") {
            try {
              const qrRes = await getQrCode();
              setQr(qrRes?.qr ?? null);
            } catch {
              setQr(null);
            }
          } else {
            setQr(null);
          }
        }
      }

      if (inst.status === "fulfilled" && inst.value.apiKey) {
        setApiKey(inst.value.apiKey);
      }

    } catch (err: unknown) {
      const errStatus = (err as { status?: number })?.status;
      if (errStatus === 403) {
        setError({ message: "Instance not active or missing scoped token. Complete payment first." });
      } else if (errStatus === 401) {
        setError({
          message: "Session expired. Please go back to instances and reopen this instance.",
          is401: true,
        });
      } else if (!isInitial) {
        setError({ message: "Failed to load WhatsApp status" });
      }
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  useEffect(() => {
    if (error?.is401) return;
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, [instanceId, fetchData, error?.is401]);

  const handleRefreshQr = useCallback(async () => {
    if (normalizeStatus(status?.status ?? "") === "connected") return;
    setRefreshingQr(true);

    let attempts = 0;
    const maxAttempts = 10;

    const tryGetQr = async (): Promise<void> => {
      attempts++;
      try {
        const stat = await getStatus();
        setStatus(stat);
        if (stat.qr) {
          setQr(stat.qr);
          toast.success("QR code ready. Scan to connect.");
          setRefreshingQr(false);
          return;
        }
        const r = await getQrCode();
        if (r?.qr) {
          setQr(r.qr);
          toast.success("QR code ready. Scan to connect.");
          setRefreshingQr(false);
          return;
        }
      } catch {}

      if (attempts < maxAttempts) {
        await new Promise((res) => setTimeout(res, 5000));
        await tryGetQr();
      } else {
        toast.error("QR code not ready. Try clicking Connect again.");
        setRefreshingQr(false);
      }
    };

    await tryGetQr();
  }, [status?.status]);

  const handleConnect = useCallback(async () => {
    if (normalizeStatus(status?.status ?? "") === "connected") return;
    setConnecting(true);
    try {
      if (normalizeStatus(status?.status ?? "") !== "connecting") {
        await connect();
      }
      toast.info("WhatsApp is starting up. QR code will appear automatically...");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Failed to connect";
      if (!msg.toLowerCase().includes("timed out") && !msg.toLowerCase().includes("timeout")) {
        toast.error(msg);
      }
    } finally {
      setConnecting(false);
    }
  }, [status?.status]);

  const handleSendMessage = useCallback(async () => {
    const phone = sendPhone.trim();
    const message = sendText.trim();
    if (!phone || !message) {
      toast.error("Please enter phone number and message");
      return;
    }
    if (!phone.startsWith("+")) {
      toast.error("Phone must start with + and include country code");
      return;
    }
    if (!apiKey) {
      toast.error("API key not available. Please refresh the page.");
      return;
    }
    setSending(true);
    try {
      await sendMessage({ phone, message }, apiKey);
      toast.success("Message sent");
      setSendText("");
    } catch (err: unknown) {
      const errStatus = (err as { status?: number })?.status;
      const msg = (err as { message?: string })?.message ?? "Failed to send message";
      toast.error(msg);
      if (errStatus === 401) {
        setError({
          message: "Session expired. Please go back to instances and reopen this instance.",
          is401: true,
        });
      }
    } finally {
      setSending(false);
    }
  }, [sendPhone, sendText, apiKey]);

  if (loading) return <WhatsAppSkeleton />;

  if (error) {
    return (
      <div className="p-6 bg-red-50/50 rounded-xl text-center space-y-4">
        <p className="text-red-600">{error.message}</p>
        {error.is401 && (
          <Link
            href={`/${locale}/instances`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go to Instances
          </Link>
        )}
      </div>
    );
  }

  const normalizedStatus = normalizeStatus(status?.status ?? "");
  const isConnected = normalizedStatus === "connected";
  const displayPhone = status?.phoneNumber || status?.phone;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Connect WhatsApp</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {qr ? (
            <div className="flex justify-center">
              <img
                src={`data:image/png;base64,${qr}`}
                alt="WhatsApp QR Code"
                className="w-72 h-72 object-contain border rounded-lg shadow-sm"
              />
            </div>
          ) : (
            <div className="text-center py-10 bg-muted/40 rounded-lg">
              <p className="text-lg font-medium">No QR code available</p>
              <p className="text-sm text-muted-foreground mt-2">
                {isConnected
                  ? "Your WhatsApp is already connected"
                  : "Click Connect to generate a QR code"}
              </p>
            </div>
          )}

          <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground">
            <li>Open WhatsApp on your phone</li>
            <li>Go to Settings → Linked Devices</li>
            <li>Tap "Link a Device"</li>
            <li>Scan the QR code above</li>
          </ol>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleConnect} disabled={isConnected || connecting}>
              {connecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Connect
            </Button>
            <Button variant="outline" onClick={handleRefreshQr} disabled={isConnected || refreshingQr}>
              {refreshingQr ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Refresh QR
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Connection Status</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className="text-base px-4 py-1.5"
            >
              {status?.status?.toUpperCase() || "UNKNOWN"}
            </Badge>
            {displayPhone && (
              <p className="mt-3 text-sm">
                <strong>Phone:</strong> {displayPhone}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await disconnect();
                  toast.success("Disconnected");
                  await fetchData();
                } catch (e) {
                  toast.error((e as { message?: string })?.message ?? "Failed to disconnect");
                }
              }}
            >
              Disconnect
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await restart();
                  toast.success("Restart requested");
                  await fetchData();
                } catch (e) {
                  toast.error((e as { message?: string })?.message ?? "Failed to restart");
                }
              }}
            >
              Restart
            </Button>
            <Button variant="ghost" onClick={() => fetchData()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h4 className="font-medium">Send Message</h4>
            <div className="space-y-2">
              <Label htmlFor="send-phone">Phone number</Label>
              <Input
                id="send-phone" placeholder="+201012345678"
                value={sendPhone} onChange={(e) => setSendPhone(e.target.value)}
                disabled={sending} className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="send-message">Message</Label>
              <Textarea
                id="send-message" placeholder="Your message here..."
                value={sendText} onChange={(e) => setSendText(e.target.value)}
                disabled={sending} rows={3} className="resize-none"
              />
            </div>
            <Button
              onClick={handleSendMessage} disabled={sending || !apiKey}
              className="w-full bg-linear-to-r from-[#A78BFA] to-[#7C3AED] hover:from-[#9F7AEA] hover:to-[#6D28D9] text-white"
            >
              {sending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" />Send Message</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
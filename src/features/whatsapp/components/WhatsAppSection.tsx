"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { getQrCode, getStatus, connect, disconnect, restart } from "../services/whatsapp-service";
import type { WhatsAppStatus, WhatsAppQrResponse } from "../types";

interface WhatsAppSectionProps {
  instanceId: string;
}

export function WhatsAppSection({ instanceId }: WhatsAppSectionProps) {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const stat = await getStatus();
      setStatus(stat);

      if (stat.status === "qr_ready" || stat.status === "disconnected") {
        const qrRes = (await getQrCode()) as WhatsAppQrResponse;
        setQr(qrRes.qr);
      }
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      console.log(err)
      if (status === 403) {
        setError("Instance not active or missing scoped token. Complete payment first.");
      } else {
        setError("Failed to load WhatsApp status");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [instanceId]);

  if (loading) {
    return <div className="animate-pulse text-center py-12">Loading WhatsApp connection...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-6 bg-red-50/50 rounded-xl text-center">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* Left: QR + Instructions */}
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
                {status?.status === "connected"
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
            <Button onClick={() => connect()} disabled={status?.status === "connected"}>
              Connect
            </Button>
            <Button variant="outline" onClick={() => getQrCode().then((r) => setQr((r as WhatsAppQrResponse).qr))}>
              Refresh QR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Right: Status + Controls */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Connection Status</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Badge
              variant={status?.status === "connected" ? "default" : "secondary"}
              className="text-base px-4 py-1.5"
            >
              {status?.status?.toUpperCase() || "UNKNOWN"}
            </Badge>
            {status?.phone && (
              <p className="mt-3 text-sm">
                <strong>Phone:</strong> {status.phone}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="destructive" onClick={() => disconnect()}>
              Disconnect
            </Button>
            <Button variant="outline" onClick={() => restart()}>
              Restart
            </Button>
            <Button variant="ghost" onClick={fetchData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
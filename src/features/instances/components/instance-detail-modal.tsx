"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Server, Copy, Check, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CodeSnippet } from "./code-snippet";
import { rotateApiKey } from "../services/instances-service";
import type { Instance } from "../types";

function buildCodeSnippets(apiKey: string) {
  return [
    {
      language: "Python",
      code: `import requests

url = "https://api.nabdaotp.com/api/v1/messages/send"
headers = {
    "Authorization": "${apiKey}",
    "Content-Type": "application/json"
}
data = {
    "phone": "+201012345678",
    "message": "Your verification code is 123456"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`,
    },
    {
      language: "Node.js",
      code: `const response = await fetch(
  "https://api.nabdaotp.com/api/v1/messages/send",
  {
    method: "POST",
    headers: {
      "Authorization": "${apiKey}",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: "+201012345678",
      message: "Your verification code is 123456",
    }),
  }
);

const data = await response.json();`,
    },
    {
      language: "cURL",
      code: `curl -X POST https://api.nabdaotp.com/api/v1/messages/send \\
  -H "Authorization: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "+201012345678",
    "message": "Your verification code is 123456"
  }'`,
    },
  ];
}

interface InstanceDetailModalProps {
  instance: Instance | null;
  onClose: () => void;
  onRotated?: () => void;
}

export function InstanceDetailModal({
  instance,
  onClose,
  onRotated,
}: InstanceDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [rotating, setRotating] = useState(false);
  const t = useTranslations("instances");
  const tCommon = useTranslations("common");

  const displayApiKey = currentApiKey ?? instance?.apiKey ?? "";

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRotateApiKey = async () => {
    setRotating(true);
    setConfirmRotate(false);
    try {
      const result = await rotateApiKey();
      setCurrentApiKey(result.apiKey);
      onRotated?.();
    } catch {
      // handled by API client
    } finally {
      setRotating(false);
    }
  };

  return (
    <Dialog open={!!instance} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Server className="h-4 w-4 text-primary-foreground" />
            </div>
            {instance?.name}
          </DialogTitle>
        </DialogHeader>

        {instance && (
          <div className="space-y-6 pt-2">
            {/* Credentials */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {t("credentials")}
              </h3>
              {[
                { label: "API ID", value: instance.apiId },
                { label: "API Key", value: displayApiKey },
                { label: "Token", value: instance.token },
              ].map((field) => (
                <div
                  key={field.label}
                  className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {field.label}
                    </p>
                    <code className="text-sm font-mono text-foreground">
                      {field.value}
                    </code>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleCopy(field.value, field.label)}
                  >
                    {copiedField === field.label ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              ))}

              {/* Rotate API Key */}
              {confirmRotate ? (
                <div className="flex items-center gap-3 bg-warning/10 border border-warning/20 rounded-lg px-4 py-3">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                  <p className="text-sm text-foreground flex-1">{t("rotateApiKeyWarning")}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmRotate(false)}
                    className="text-xs shrink-0"
                  >
                    {tCommon("actions.cancel")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleRotateApiKey}
                    disabled={rotating}
                    className="text-xs shrink-0 bg-warning/20 text-warning hover:bg-warning/30 border-0"
                  >
                    {rotating ? <Loader2 className="h-3 w-3 animate-spin" /> : t("confirmRotate")}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmRotate(true)}
                  disabled={rotating}
                  className="text-xs text-muted-foreground gap-2 w-full justify-start"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t("rotateApiKey")}
                </Button>
              )}
            </div>

            {/* Usage Stats */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {t("usageStats")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">
                    {t("otpSent")}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {(instance.otpSent ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">
                    {t("otpVerified")}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {(instance.otpVerified ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Code Snippets */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {t("integrationCode")}
              </h3>
              <CodeSnippet snippets={buildCodeSnippets(displayApiKey)} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

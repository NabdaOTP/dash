"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Server, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CodeSnippet } from "./code-snippet";
import type { Instance } from "../types";

const codeSnippets = [
  {
    language: "Python",
    code: `import requests

url = "https://api.nadbaotp.com/v1/otp/send"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "phone": "+966501234567",
    "template": "Your OTP is {{code}}"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`,
  },
  {
    language: "Node.js",
    code: `const axios = require('axios');

const response = await axios.post(
  'https://api.nadbaotp.com/v1/otp/send',
  {
    phone: '+966501234567',
    template: 'Your OTP is {{code}}'
  },
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);

console.log(response.data);`,
  },
  {
    language: "cURL",
    code: `curl -X POST https://api.nadbaotp.com/v1/otp/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "+966501234567",
    "template": "Your OTP is {{code}}"
  }'`,
  },
];

interface InstanceDetailModalProps {
  instance: Instance | null;
  onClose: () => void;
}

export function InstanceDetailModal({
  instance,
  onClose,
}: InstanceDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const t = useTranslations("instances");

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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
                { label: "API Key", value: instance.apiKey },
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
              <CodeSnippet snippets={codeSnippets} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

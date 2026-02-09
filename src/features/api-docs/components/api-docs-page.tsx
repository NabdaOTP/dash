"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Play, CheckCircle, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeSnippet } from "@/features/instances/components/code-snippet";

const docSections = [
  { id: "getting-started", labelKey: "sections.gettingStarted" },
  { id: "authentication", labelKey: "sections.authentication" },
  { id: "send-otp", labelKey: "sections.sendOtp" },
  { id: "verify-otp", labelKey: "sections.verifyOtp" },
  { id: "rate-limits", labelKey: "sections.rateLimits" },
];

export function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [testPhone, setTestPhone] = useState("+966501234567");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const t = useTranslations("apiDocs");

  const handleTestApi = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTestResult(
        JSON.stringify(
          {
            success: true,
            message: "OTP sent successfully",
            request_id: "req_" + Math.random().toString(36).substring(7),
            expires_in: 300,
          },
          null,
          2
        )
      );
      setTesting(false);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="lg:w-56 shrink-0">
          <div className="lg:sticky lg:top-6 space-y-1">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              {t("title")}
            </h2>
            {docSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  activeSection === section.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {t(section.labelKey)}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Getting Started */}
          {activeSection === "getting-started" && (
            <section className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("sections.gettingStarted")}</h1>
                <p className="text-muted-foreground mt-2">{t("gettingStarted.desc")}</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="font-semibold text-foreground">{t("gettingStarted.quickStart")}</h3>
                <div className="space-y-3">
                  {[
                    t("gettingStarted.step1"),
                    t("gettingStarted.step2"),
                    t("gettingStarted.step3"),
                    t("gettingStarted.step4"),
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
                      </div>
                      <p className="text-sm text-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">{t("gettingStarted.baseUrl")}</h3>
                <code className="block bg-muted/50 rounded-lg px-4 py-3 text-sm font-mono text-foreground">
                  https://api.nadbaotp.com/v1
                </code>
              </div>
            </section>
          )}

          {/* Authentication */}
          {activeSection === "authentication" && (
            <section className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("sections.authentication")}</h1>
                <p className="text-muted-foreground mt-2">{t("auth.desc")}</p>
              </div>

              <CodeSnippet
                snippets={[
                  {
                    language: "Header",
                    code: "Authorization: Bearer YOUR_API_KEY",
                  },
                ]}
              />

              <div className="bg-accent/50 rounded-xl border border-primary/20 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{t("auth.securityTitle")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("auth.securityDesc")}</p>
                </div>
              </div>
            </section>
          )}

          {/* Send OTP */}
          {activeSection === "send-otp" && (
            <section className="space-y-6 animate-fade-in">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-success/10 text-success border-success/20">POST</Badge>
                  <code className="text-sm font-mono text-foreground">/otp/send</code>
                </div>
                <h1 className="text-2xl font-bold text-foreground">{t("sections.sendOtp")}</h1>
                <p className="text-muted-foreground mt-2">{t("sendOtp.desc")}</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">{t("sendOtp.requestBody")}</h3>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border">
                        <th className="text-start px-4 py-3 font-semibold text-foreground">{t("param")}</th>
                        <th className="text-start px-4 py-3 font-semibold text-foreground">{t("type")}</th>
                        <th className="text-start px-4 py-3 font-semibold text-foreground">{t("description")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="px-4 py-3 font-mono text-primary">phone</td>
                        <td className="px-4 py-3 text-muted-foreground">string</td>
                        <td className="px-4 py-3 text-foreground">{t("sendOtp.phoneDesc")}</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="px-4 py-3 font-mono text-primary">template</td>
                        <td className="px-4 py-3 text-muted-foreground">string</td>
                        <td className="px-4 py-3 text-foreground">{t("sendOtp.templateDesc")}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-primary">expiry</td>
                        <td className="px-4 py-3 text-muted-foreground">number</td>
                        <td className="px-4 py-3 text-foreground">{t("sendOtp.expiryDesc")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <CodeSnippet
                snippets={[
                  {
                    language: "Request",
                    code: `POST /v1/otp/send
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "phone": "+966501234567",
  "template": "Your verification code is {{code}}",
  "expiry": 300
}`,
                  },
                  {
                    language: "Response",
                    code: `{
  "success": true,
  "message": "OTP sent successfully",
  "request_id": "req_abc123def456",
  "expires_in": 300
}`,
                  },
                ]}
              />
            </section>
          )}

          {/* Verify OTP */}
          {activeSection === "verify-otp" && (
            <section className="space-y-6 animate-fade-in">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-success/10 text-success border-success/20">POST</Badge>
                  <code className="text-sm font-mono text-foreground">/otp/verify</code>
                </div>
                <h1 className="text-2xl font-bold text-foreground">{t("sections.verifyOtp")}</h1>
                <p className="text-muted-foreground mt-2">{t("verifyOtp.desc")}</p>
              </div>

              <CodeSnippet
                snippets={[
                  {
                    language: "Request",
                    code: `POST /v1/otp/verify
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "phone": "+966501234567",
  "code": "123456",
  "request_id": "req_abc123def456"
}`,
                  },
                  {
                    language: "Response (Success)",
                    code: `{
  "success": true,
  "message": "OTP verified successfully",
  "verified": true
}`,
                  },
                  {
                    language: "Response (Failed)",
                    code: `{
  "success": false,
  "message": "Invalid or expired OTP",
  "verified": false,
  "attempts_remaining": 2
}`,
                  },
                ]}
              />
            </section>
          )}

          {/* Rate Limits */}
          {activeSection === "rate-limits" && (
            <section className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("sections.rateLimits")}</h1>
                <p className="text-muted-foreground mt-2">{t("rateLimits.desc")}</p>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-start px-4 py-3 font-semibold text-foreground">{t("rateLimits.plan")}</th>
                      <th className="text-start px-4 py-3 font-semibold text-foreground">{t("rateLimits.reqPerMin")}</th>
                      <th className="text-start px-4 py-3 font-semibold text-foreground">{t("rateLimits.dailyLimit")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 font-medium text-foreground">Free</td>
                      <td className="px-4 py-3 text-muted-foreground">10</td>
                      <td className="px-4 py-3 text-muted-foreground">100</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 font-medium text-foreground">Pro</td>
                      <td className="px-4 py-3 text-muted-foreground">60</td>
                      <td className="px-4 py-3 text-muted-foreground">5,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Enterprise</td>
                      <td className="px-4 py-3 text-muted-foreground">300</td>
                      <td className="px-4 py-3 text-muted-foreground">{t("rateLimits.unlimited")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <Separator className="my-8" />

          {/* Try it Live */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Play className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">{t("tryItLive")}</h2>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("phoneNumber")}</label>
                <Input
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+966501234567"
                  className="bg-background font-mono"
                />
              </div>

              <Button
                onClick={handleTestApi}
                disabled={testing}
                className="gradient-primary text-primary-foreground gap-2"
              >
                <Send className="h-4 w-4" />
                {testing ? t("sending") : t("sendTestOtp")}
              </Button>

              {testResult && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">Response (200 OK)</span>
                  </div>
                  <pre className="bg-muted/30 rounded-lg p-4 text-sm font-mono text-foreground overflow-x-auto">
                    {testResult}
                  </pre>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

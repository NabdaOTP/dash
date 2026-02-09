"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, MessageCircle, Phone, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const t = useTranslations("contact");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-3">
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-card">
            {submitted ? (
              <div className="text-center py-12 space-y-4 animate-fade-in">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{t("successTitle")}</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">{t("successDesc")}</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setEmail("");
                    setMessage("");
                  }}
                >
                  {t("sendAnother")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">
                    {t("name")}
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="h-11 bg-background"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-sm font-medium text-foreground">
                    {t("email")}
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 bg-background"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium text-foreground">
                    {t("message")}
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("messagePlaceholder")}
                    rows={5}
                    className="bg-background resize-none"
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground gap-2">
                  <Send className="h-4 w-4" />
                  {t("submit")}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Support Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border p-5 space-y-3 shadow-card">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{t("emailSupport")}</h3>
            <p className="text-sm text-muted-foreground">{t("emailSupportDesc")}</p>
            <a href="mailto:support@nadbaotp.com" className="text-sm text-primary font-medium hover:underline">
              support@nadbaotp.com
            </a>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 space-y-3 shadow-card">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-success" />
            </div>
            <h3 className="font-semibold text-foreground">{t("whatsapp")}</h3>
            <p className="text-sm text-muted-foreground">{t("whatsappDesc")}</p>
            <a href="https://wa.me/966501234567" className="text-sm text-primary font-medium hover:underline">
              +966 50 123 4567
            </a>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 space-y-3 shadow-card">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-accent-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">{t("liveChat")}</h3>
            <p className="text-sm text-muted-foreground">{t("liveChatDesc")}</p>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageCircle className="h-3.5 w-3.5" />
              {t("startChat")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

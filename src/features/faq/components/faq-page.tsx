"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  nameKey: string;
  items: FaqItem[];
}

const faqCategories: FaqCategory[] = [
  {
    nameKey: "categories.setup",
    items: [
      {
        q: "How do I get started with NadbaOTP?",
        a: "Create an account, connect your WhatsApp number by scanning the QR code on the dashboard, then generate an API key from the Instances page. You can start sending OTP messages immediately after setup.",
      },
      {
        q: "How do I connect my WhatsApp number?",
        a: "Go to the Dashboard and scan the QR code using your WhatsApp mobile app. Navigate to Settings → Linked Devices → Link a Device, then point your camera at the QR code displayed on screen.",
      },
      {
        q: "Can I use multiple WhatsApp numbers?",
        a: "Yes! You can create multiple instances, each connected to a different WhatsApp number. This is useful for separating production and testing environments, or managing multiple applications.",
      },
    ],
  },
  {
    nameKey: "categories.troubleshooting",
    items: [
      {
        q: "My WhatsApp session keeps disconnecting. What should I do?",
        a: "Ensure your phone has a stable internet connection and WhatsApp is running in the background. You may also need to re-scan the QR code if the session expires. Sessions typically last 14 days.",
      },
      {
        q: "OTP messages are not being delivered. How can I fix this?",
        a: "Check that the recipient's phone number is formatted correctly with the country code (e.g., +966). Also verify that your WhatsApp session is active and that you haven't exceeded your rate limits.",
      },
      {
        q: "I'm getting a 429 error. What does it mean?",
        a: "A 429 error means you've exceeded the rate limit for your plan. Wait a few minutes before retrying, or consider upgrading your plan for higher limits. You can check your current usage on the Dashboard.",
      },
    ],
  },
  {
    nameKey: "categories.pricing",
    items: [
      {
        q: "What plans are available?",
        a: "We offer three plans: Free (100 OTPs/day), Pro (5,000 OTPs/day at $29/month), and Enterprise (unlimited OTPs with custom pricing). All plans include API access and dashboard analytics.",
      },
      {
        q: "Is there a free trial?",
        a: "Yes! The Free plan is available at no cost and includes 100 OTP messages per day. This is perfect for testing and development. No credit card required to sign up.",
      },
      {
        q: "Can I change my plan at any time?",
        a: "Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately, and billing is prorated.",
      },
    ],
  },
  {
    nameKey: "categories.security",
    items: [
      {
        q: "How secure is NadbaOTP?",
        a: "We use industry-standard encryption for all data in transit and at rest. API keys are hashed, OTP codes are generated using cryptographically secure random number generators, and all sessions are encrypted end-to-end.",
      },
      {
        q: "How long are OTP codes valid?",
        a: "By default, OTP codes expire after 5 minutes (300 seconds). You can customize this duration between 60 and 600 seconds using the 'expiry' parameter in the Send OTP API call.",
      },
      {
        q: "What happens if someone enters the wrong OTP code?",
        a: "Users have 3 attempts to enter the correct OTP code. After 3 failed attempts, the OTP is automatically invalidated and a new one must be requested. This prevents brute-force attacks.",
      },
    ],
  },
];

export function FaqPage() {
  const [search, setSearch] = useState("");
  const t = useTranslations("faq");

  const filteredCategories = faqCategories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mx-auto">
          <HelpCircle className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-9 bg-card h-11"
        />
      </div>

      {/* FAQ Sections */}
      <div className="space-y-6">
        {filteredCategories.map((category) => (
          <div key={category.nameKey} className="space-y-3">
            <Badge variant="outline" className="bg-accent/50 text-accent-foreground border-primary/20">
              {t(category.nameKey)}
            </Badge>

            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
              <Accordion type="single" collapsible>
                {category.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`${category.nameKey}-${i}`}
                    className="border-b border-border last:border-0"
                  >
                    <AccordionTrigger className="px-5 py-4 text-sm font-medium text-foreground hover:text-primary hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("noResults")}</p>
        </div>
      )}
    </div>
  );
}

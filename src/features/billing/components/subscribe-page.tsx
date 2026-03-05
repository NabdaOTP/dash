"use client";

import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/auth-context";
import * as billingService from "@/features/billing/services/billing-service";

export function SubscribePage() {
  const searchParams = useSearchParams();
  const instanceId = searchParams.get("instanceId");
  const { selectInstance } = useAuth();

  const [planId, setPlanId] = useState<string | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (!instanceId) {
      toast.error("No instance selected");
      setLoadingPlans(false);
      return;
    }

    const init = async () => {
      try {
        await selectInstance({ instanceId });
        const plans = await billingService.getPlans();
        if (plans.length > 0) {
          setPlanId(plans[0].id);
        }
      } catch (err: unknown) {
        const message = (err as { message?: string })?.message || "Failed to prepare subscription";
        toast.error(message);
      } finally {
        setLoadingPlans(false);
      }
    };

    init();
  }, [instanceId, selectInstance]);

  const handleSubscribe = async () => {
    if (!planId) {
      toast.error("No billing plan available");
      return;
    }
    setSubscribing(true);
    try {
      const result = await billingService.subscribe(planId);
      const checkoutUrl = result?.url || result?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error("No checkout URL returned from server");
      }

      window.location.href = checkoutUrl;
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || "Failed to start subscription";
      toast.error(message);
    } finally {
      setSubscribing(false);
    }
  };

  const isButtonDisabled = loadingPlans || subscribing || !planId;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Link
          href="/instances"
          className="flex items-center gap-2 text-white/70 hover:text-white mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Instances
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-linear-to-r from-violet-600 to-indigo-600 text-white text-center py-2 text-sm font-semibold tracking-widest">
            BEST VALUE
          </div>

          <div className="p-10 text-center">
            <div className="text-6xl font-bold text-slate-900">$10</div>
            <div className="text-xl text-slate-500 mt-1">/month</div>

            <p className="mt-6 text-lg font-medium text-slate-700">
              Everything you need to send unlimited messages
            </p>

            <div className="my-10 space-y-4 text-left">
              {[
                "Unlimited WhatsApp Messages",
                "No Per-Message Fee",
                "10-Day Free Trial",
                "RESTful API Access",
                "Priority Support",
                "Cancel Anytime",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubscribe}
              size="lg"
              disabled={isButtonDisabled}
              className="w-full bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-lg py-7 rounded-2xl font-semibold shadow-lg"
            >
              {subscribing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : (
                "Subscribe"
              )}
            </Button>

            <p className="text-xs text-slate-500 mt-6">
              No credit card required • Setup in 2 minutes
            </p>
          </div>
        </div>

        <p className="text-center text-white/60 text-sm mt-8">
          Any problems? Contact support
        </p>
      </div>
    </div>
  );
}

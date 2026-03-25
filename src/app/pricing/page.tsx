"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Mic, Sparkles, Crown } from "lucide-react";

const TIERS = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Mic,
    description: "Try voice transcription with no sign-up",
    features: [
      "Unlimited transcription",
      "Browser speech recognition",
      "Browser voice playback",
      "20 languages",
      "Chat & table view",
    ],
    limitations: ["No AI translation", "Chrome/Edge only", "Basic voice quality"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    id: "basic" as const,
    name: "Basic",
    price: "$4.99",
    period: "/month",
    icon: Sparkles,
    description: "AI-powered translation for everyday use",
    features: [
      "200 minutes/month",
      "AI translation (GPT-4o-mini)",
      "Browser speech recognition",
      "Browser voice playback",
      "20 languages",
      "Chat & table view",
      "Buy more minute packs",
    ],
    limitations: ["Chrome/Edge only"],
    cta: "Get Basic",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: "$9.99",
    period: "/month",
    icon: Crown,
    description: "Best quality with natural HD voices",
    features: [
      "100 minutes/month",
      "AI translation (GPT-4o-mini)",
      "Deepgram speech recognition",
      "OpenAI HD voice playback",
      "Works on all browsers",
      "20 languages",
      "Chat & table view",
      "Buy more minute packs",
      "Priority support",
    ],
    limitations: [],
    cta: "Get Premium",
    highlighted: false,
  },
];

const MINUTE_PACKS = [
  { tier: "basic", minutes: 100, price: "$2.99" },
  { tier: "basic", minutes: 300, price: "$7.99" },
  { tier: "premium", minutes: 50, price: "$4.99" },
  { tier: "premium", minutes: 150, price: "$12.99" },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <main className="flex-1 flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/")}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Pricing</h1>
            <p className="text-muted-foreground text-sm">Choose the plan that fits your needs</p>
          </div>
        </div>

        {/* Tiers */}
        <div className="grid gap-4 md:grid-cols-3 mb-12">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  tier.highlighted
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border"
                }`}
              >
                {"badge" in tier && tier.badge && (
                  <Badge className="absolute -top-2.5 left-4 text-xs">{tier.badge}</Badge>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tier.highlighted ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{tier.name}</h3>
                    <p className="text-xs text-muted-foreground">{tier.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground text-sm">{tier.period}</span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                  {tier.limitations.map((l) => (
                    <li key={l} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-4 text-center shrink-0">-</span>
                      {l}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.highlighted ? "default" : "outline"}
                  className="w-full rounded-xl py-5 font-semibold"
                  onClick={() =>
                    tier.id === "free" ? router.push("/app?from=en&to=es") : router.push("/signup")
                  }
                >
                  {tier.cta}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Minute packs */}
        <div>
          <h2 className="text-xl font-bold mb-2">Minute Packs</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Run out of minutes? Buy more anytime. Purchased minutes never expire.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MINUTE_PACKS.map((pack) => (
              <div
                key={`${pack.tier}-${pack.minutes}`}
                className="rounded-xl border border-border p-4 text-center"
              >
                <Badge variant="secondary" className="mb-2 capitalize text-xs">
                  {pack.tier}
                </Badge>
                <p className="text-2xl font-bold">{pack.minutes}</p>
                <p className="text-xs text-muted-foreground mb-3">minutes</p>
                <p className="font-semibold">{pack.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

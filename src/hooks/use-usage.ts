"use client";

import { useState, useEffect, useCallback } from "react";
import type { Tier } from "@/lib/types";

interface UsageState {
  tier: Tier;
  minutesRemaining: number;
  purchasedMinutes: number;
  totalAvailable: number;
  loaded: boolean;
}

export function useUsage() {
  const [usage, setUsage] = useState<UsageState>({
    tier: "free",
    minutesRemaining: 0,
    purchasedMinutes: 0,
    totalAvailable: 0,
    loaded: false,
  });

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/usage");
      if (!res.ok) return;
      const data = await res.json();
      setUsage({
        tier: data.tier || "free",
        minutesRemaining: data.minutesRemaining || 0,
        purchasedMinutes: data.purchasedMinutes || 0,
        totalAvailable: (data.minutesRemaining || 0) + (data.purchasedMinutes || 0),
        loaded: true,
      });
    } catch {
      setUsage((prev) => ({ ...prev, loaded: true }));
    }
  }, []);

  const reportUsage = useCallback(async (secondsUsed: number) => {
    if (secondsUsed < 1) return;
    try {
      const res = await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secondsUsed }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsage((prev) => ({
          ...prev,
          minutesRemaining: data.minutesRemaining,
          purchasedMinutes: data.purchasedMinutes,
          totalAvailable: data.minutesRemaining + data.purchasedMinutes,
        }));
      }
    } catch {
      // Silent fail — usage will be reconciled next session
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const hasMinutes = usage.tier === "free" || usage.totalAvailable > 0;

  return { ...usage, hasMinutes, fetchUsage, reportUsage };
}

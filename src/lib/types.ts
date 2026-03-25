export type Tier = "free" | "basic" | "premium";

export type TranslationModel = "fast" | "accurate";

export type ViewMode = "chat" | "table";

export interface TranslationEntry {
  id: string;
  original: string;
  translated: string;
  fromLang: string;
  toLang: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  email: string;
  tier: Tier;
  minutesRemaining: number;
  purchasedMinutes: number;
}

export interface UsageLog {
  id: string;
  userId: string;
  sessionStart: number;
  sessionEnd: number;
  minutesUsed: number;
  tier: Tier;
}

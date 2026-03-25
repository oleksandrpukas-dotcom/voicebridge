"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, useEffect, Suspense } from "react";
import { getLanguage, LANGUAGES } from "@/lib/languages";
import { useTranslator } from "@/hooks/use-translator";
import { useUsage } from "@/hooks/use-usage";
import type { ViewMode, TranslationModel } from "@/lib/types";
import { ChatView } from "@/components/chat-view";
import { TableView } from "@/components/table-view";
import { SoundWave } from "@/components/sound-wave";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Mic,
  MicOff,
  ArrowLeft,
  Settings,
  Trash2,
  SplitSquareVertical,
  MessageSquare,
  Volume2,
  VolumeX,
  ArrowRightLeft,
  Crown,
  Zap,
  Brain,
} from "lucide-react";

function TranslatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const fromCode = searchParams.get("from") || "en";
  const toCode = searchParams.get("to") || "es";

  const [fromLang, setFromLang] = useState(fromCode);
  const [toLang, setToLang] = useState(toCode);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [model, setModel] = useState<TranslationModel>("fast");

  const usage = useUsage();

  const {
    isListening,
    interimText,
    entries,
    isTranslating,
    isSpeaking,
    error,
    secondsUsed,
    toggle,
    stop,
    clearHistory,
  } = useTranslator({ fromLang, toLang, tier: usage.tier, autoSpeak, model });

  // Report usage when stopping
  const prevListening = useCallback(() => {
    if (!isListening && secondsUsed > 0 && usage.tier !== "free") {
      usage.reportUsage(secondsUsed);
    }
  }, [isListening, secondsUsed, usage]);

  useEffect(() => {
    prevListening();
  }, [isListening, prevListening]);

  // Auto-stop if no minutes left (paid tiers)
  useEffect(() => {
    if (usage.tier !== "free" && !usage.hasMinutes && isListening) {
      stop();
    }
  }, [usage.tier, usage.hasMinutes, isListening, stop]);

  const fromLanguage = getLanguage(fromLang);
  const toLanguage = getLanguage(toLang);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const swap = useCallback(() => {
    setFromLang(toLang);
    setToLang(fromLang);
  }, [fromLang, toLang]);

  const tierColor = {
    free: "bg-muted text-muted-foreground",
    basic: "bg-blue-500/10 text-blue-600",
    premium: "bg-amber-500/10 text-amber-600",
  }[usage.tier];

  return (
    <div className="flex-1 flex flex-col h-dvh max-h-dvh overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shrink-0">
        <button
          onClick={() => router.push("/")}
          className="p-2 -ml-1 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            <span className="text-sm">{fromLanguage?.flag}</span>
            <span className="text-xs font-medium truncate">{fromLanguage?.name}</span>
          </button>

          <button onClick={swap} className="p-1 rounded-md hover:bg-muted transition-colors">
            <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            <span className="text-sm">{toLanguage?.flag}</span>
            <span className="text-xs font-medium truncate">{toLanguage?.name}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px] font-mono tabular-nums">
            {formatTime(secondsUsed)}
          </Badge>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Settings dropdown */}
      {showSettings && (
        <div className="border-b border-border bg-muted/30 px-4 py-3 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm">View mode</span>
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("chat")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "chat" ? "bg-background shadow-sm" : ""
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chat
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === "table" ? "bg-background shadow-sm" : ""
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" /> Table
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Auto-speak translations</span>
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`p-2 rounded-lg transition-colors ${autoSpeak ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm">Translation quality</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {model === "fast" ? "GPT-4o-mini — fast & cheap" : "GPT-4o — slower but more accurate"}
              </p>
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setModel("fast")}
                disabled={usage.tier === "free"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-40 ${
                  model === "fast" ? "bg-background shadow-sm" : ""
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Fast
              </button>
              <button
                onClick={() => setModel("accurate")}
                disabled={usage.tier === "free"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-40 ${
                  model === "accurate" ? "bg-background shadow-sm" : ""
                }`}
              >
                <Brain className="w-3.5 h-3.5" /> Accurate
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Source language</span>
            <select
              value={fromLang}
              onChange={(e) => setFromLang(e.target.value)}
              className="px-2 py-1 rounded-md bg-background border border-border text-sm"
            >
              {LANGUAGES.filter((l) => l.code !== toLang).map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Target language</span>
            <select
              value={toLang}
              onChange={(e) => setToLang(e.target.value)}
              className="px-2 py-1 rounded-md bg-background border border-border text-sm"
            >
              {LANGUAGES.filter((l) => l.code !== fromLang).map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Plan</span>
            <div className="flex items-center gap-2">
              <Badge className={`capitalize text-xs ${tierColor}`}>
                {usage.tier === "premium" && <Crown className="w-3 h-3 mr-1" />}
                {usage.tier}
              </Badge>
              {usage.tier !== "free" && (
                <span className="text-xs text-muted-foreground">
                  {usage.totalAvailable} min left
                </span>
              )}
            </div>
          </div>

          {usage.tier === "free" && (
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="w-full">
                <Crown className="w-3.5 h-3.5 mr-2" />
                Upgrade for AI translations
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="sm" onClick={clearHistory} className="w-full text-muted-foreground">
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            Clear history
          </Button>
        </div>
      )}

      {/* No minutes warning */}
      {usage.tier !== "free" && !usage.hasMinutes && (
        <div className="px-4 py-3 bg-amber-500/10 text-amber-700 text-xs text-center shrink-0">
          You&apos;ve used all your minutes.{" "}
          <Link href="/pricing" className="underline font-medium">
            Buy more
          </Link>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-xs text-center shrink-0">
          {error}
        </div>
      )}

      {/* Main content area */}
      {viewMode === "chat" ? (
        <ChatView entries={entries} interimText={interimText} isTranslating={isTranslating} />
      ) : (
        <TableView entries={entries} interimText={interimText} isTranslating={isTranslating} />
      )}

      {/* Bottom controls */}
      <div className="border-t border-border bg-background/95 backdrop-blur px-4 py-4 shrink-0 safe-bottom">
        <div className="flex items-center justify-center gap-4">
          <SoundWave
            active={isListening}
            className={`w-16 ${isListening ? "text-primary" : "text-muted-foreground/30"}`}
          />

          <button
            onClick={toggle}
            disabled={usage.tier !== "free" && !usage.hasMinutes}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              isListening
                ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25"
                : "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
            }`}
          >
            {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            {isListening && (
              <span className="absolute inset-0 rounded-full border-2 border-destructive animate-ping opacity-30" />
            )}
          </button>

          <SoundWave
            active={isListening}
            className={`w-16 ${isListening ? "text-primary" : "text-muted-foreground/30"}`}
          />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-2">
          {usage.tier !== "free" && !usage.hasMinutes
            ? "No minutes remaining"
            : isSpeaking
              ? "Speaking translation..."
              : isTranslating
                ? "Translating..."
                : isListening
                  ? "Listening..."
                  : "Tap to start listening"}
        </p>
      </div>
    </div>
  );
}

export default function TranslatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center h-dvh">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <TranslatorContent />
    </Suspense>
  );
}

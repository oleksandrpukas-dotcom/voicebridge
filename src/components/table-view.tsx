"use client";

import { useEffect, useRef } from "react";
import type { TranslationEntry } from "@/lib/types";
import { getLanguage } from "@/lib/languages";

interface TableViewProps {
  entries: TranslationEntry[];
  interimText: string;
  isTranslating: boolean;
}

export function TableView({ entries, interimText, isTranslating }: TableViewProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const lastEntry = entries[entries.length - 1];
  const from = lastEntry ? getLanguage(lastEntry.fromLang) : null;
  const to = lastEntry ? getLanguage(lastEntry.toLang) : null;

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, interimText]);

  const latestOriginal = interimText || lastEntry?.original || "";
  const latestTranslated = lastEntry?.translated || "";

  return (
    <div className="flex-1 flex flex-col">
      {/* Their side (rotated 180 degrees so person across table can read) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 border-b-2 border-dashed border-border rotate-180">
        <div ref={topRef} />
        {to && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{to.flag}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {to.name}
            </span>
          </div>
        )}
        <p className="text-2xl font-semibold text-center leading-relaxed max-w-sm">
          {isTranslating ? (
            <span className="text-muted-foreground animate-pulse">Translating...</span>
          ) : latestTranslated ? (
            latestTranslated
          ) : (
            <span className="text-muted-foreground">Translation appears here</span>
          )}
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center py-2 bg-muted/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>▲ Their side</span>
          <span className="w-px h-3 bg-border" />
          <span>Your side ▼</span>
        </div>
      </div>

      {/* Your side */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {from && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{from.flag}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {from.name}
            </span>
          </div>
        )}
        <p className="text-2xl font-semibold text-center leading-relaxed max-w-sm">
          {latestOriginal ? (
            <>
              {latestOriginal}
              {interimText && <span className="animate-pulse">|</span>}
            </>
          ) : (
            <span className="text-muted-foreground">Speak to see text here</span>
          )}
        </p>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { TranslationEntry } from "@/lib/types";
import { getLanguage } from "@/lib/languages";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatViewProps {
  entries: TranslationEntry[];
  interimText: string;
  isTranslating: boolean;
}

export function ChatView({ entries, interimText, isTranslating }: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, interimText]);

  if (entries.length === 0 && !interimText) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-muted-foreground text-center text-sm">
          Start speaking to see translations appear here
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-4 p-4">
        {entries.map((entry) => {
          const from = getLanguage(entry.fromLang);
          const to = getLanguage(entry.toLang);
          return (
            <div key={entry.id} className="flex flex-col gap-2">
              {/* Original */}
              <div className="flex justify-start">
                <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-md bg-muted">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs">{from?.flag}</span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {from?.name}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{entry.original}</p>
                </div>
              </div>
              {/* Translation */}
              {entry.translated && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-md bg-primary text-primary-foreground">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs">{to?.flag}</span>
                      <span className="text-[10px] font-medium opacity-70 uppercase tracking-wider">
                        {to?.name}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{entry.translated}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Interim text */}
        {interimText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-md bg-muted/60 border border-dashed border-border">
              <p className="text-sm text-muted-foreground italic">{interimText}...</p>
            </div>
          </div>
        )}

        {/* Translating indicator */}
        {isTranslating && (
          <div className="flex justify-end">
            <div className="px-4 py-3 rounded-2xl bg-primary/20">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

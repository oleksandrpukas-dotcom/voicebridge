"use client";

import { useState, useMemo } from "react";
import { LANGUAGES, type Language } from "@/lib/languages";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LanguageSelectorProps {
  label: string;
  selected: Language;
  onSelect: (lang: Language) => void;
  exclude?: string;
}

export function LanguageSelector({ label, selected, onSelect, exclude }: LanguageSelectorProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return LANGUAGES.filter(
      (l) =>
        l.code !== exclude &&
        (l.name.toLowerCase().includes(q) ||
          l.nativeName.toLowerCase().includes(q) ||
          l.code.includes(q))
    );
  }, [search, exclude]);

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border">
        <span className="text-2xl">{selected.flag}</span>
        <span className="text-lg font-semibold">{selected.name}</span>
        <span className="text-sm text-muted-foreground ml-auto">{selected.nativeName}</span>
      </div>
      <input
        type="text"
        placeholder="Search languages..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <ScrollArea className="h-48 rounded-xl border border-border bg-card">
        <div className="p-1">
          {filtered.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onSelect(lang);
                setSearch("");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                selected.code === lang.code
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted/80"
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
              <span className="text-sm opacity-70 ml-auto">{lang.nativeName}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">No languages found</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

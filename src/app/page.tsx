"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LANGUAGES, type Language } from "@/lib/languages";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Mic, Globe, Zap } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [fromLang, setFromLang] = useState<Language>(LANGUAGES[0]);
  const [toLang, setToLang] = useState<Language>(LANGUAGES[1]);

  const swap = () => {
    setFromLang(toLang);
    setToLang(fromLang);
  };

  const start = () => {
    router.push(`/app?from=${fromLang.code}&to=${toLang.code}`);
  };

  return (
    <main className="flex-1 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto w-full">
        <span className="text-lg font-bold">
          Voice<span className="text-primary/60">Bridge</span>
        </span>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-lg mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Mic className="w-3 h-3" />
            Real-time voice translation
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Voice<span className="text-primary/60">Bridge</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Speak in your language. Hear the translation instantly. No app install needed.
          </p>
        </div>

        {/* Language selectors */}
        <div className="w-full space-y-4 mb-8">
          <LanguageSelector
            label="I speak"
            selected={fromLang}
            onSelect={setFromLang}
            exclude={toLang.code}
          />

          <div className="flex justify-center">
            <button
              onClick={swap}
              className="p-3 rounded-full bg-muted hover:bg-muted/80 border border-border transition-all hover:scale-105 active:scale-95"
              aria-label="Swap languages"
            >
              <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <LanguageSelector
            label="Translate to"
            selected={toLang}
            onSelect={setToLang}
            exclude={fromLang.code}
          />
        </div>

        <Button onClick={start} size="lg" className="w-full text-lg py-6 rounded-2xl font-semibold">
          <Mic className="w-5 h-5 mr-2" />
          Start Translating
        </Button>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          Free to try — no sign-up required
        </p>
      </section>

      {/* Features strip */}
      <section className="border-t border-border bg-muted/30 py-8 px-4">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Always listening</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">20 languages</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Instant voice</span>
          </div>
        </div>
      </section>
    </main>
  );
}

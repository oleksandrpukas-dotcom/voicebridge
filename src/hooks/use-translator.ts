"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { startListening, stopListening, pauseListening, resumeListening, speak } from "@/lib/speech";
import { getLanguage } from "@/lib/languages";
import type { TranslationEntry, Tier, TranslationModel } from "@/lib/types";

interface UseTranslatorOptions {
  fromLang: string;
  toLang: string;
  tier: Tier;
  autoSpeak: boolean;
  model: TranslationModel;
}

export function useTranslator({ fromLang, toLang, tier, autoSpeak, model }: UseTranslatorOptions) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [entries, setEntries] = useState<TranslationEntry[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsUsed, setSecondsUsed] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const translationQueue = useRef<string[]>([]);
  const isProcessing = useRef(false);

  const fromLanguage = getLanguage(fromLang);
  const toLanguage = getLanguage(toLang);

  useEffect(() => {
    return () => {
      stopListening();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessing.current || translationQueue.current.length === 0) return;
    isProcessing.current = true;

    const text = translationQueue.current.shift()!;
    setIsTranslating(true);

    try {
      if (tier === "free") {
        // Free tier: no AI translation, just show the transcription
        const entry: TranslationEntry = {
          id: crypto.randomUUID(),
          original: text,
          translated: "",
          fromLang,
          toLang,
          timestamp: Date.now(),
        };
        setEntries((prev) => [...prev, entry]);
      } else {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            fromLang: fromLanguage?.name || fromLang,
            toLang: toLanguage?.name || toLang,
            model,
          }),
        });

        if (!res.ok) throw new Error("Translation failed");

        const { translated } = await res.json();

        const entry: TranslationEntry = {
          id: crypto.randomUUID(),
          original: text,
          translated,
          fromLang,
          toLang,
          timestamp: Date.now(),
        };
        setEntries((prev) => [...prev, entry]);

        if (autoSpeak && translated && toLanguage) {
          setIsSpeaking(true);
          pauseListening();
          try {
            if (tier === "premium") {
              const audioRes = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: translated, langCode: toLang }),
              });
              if (audioRes.ok) {
                const blob = await audioRes.blob();
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                await new Promise<void>((resolve) => {
                  audio.onended = () => resolve();
                  audio.onerror = () => resolve();
                  audio.play();
                });
                URL.revokeObjectURL(url);
              } else {
                await speak(translated, toLanguage.speechCode);
              }
            } else {
              await speak(translated, toLanguage.speechCode);
            }
          } catch {
            // TTS failed silently
          } finally {
            setIsSpeaking(false);
            resumeListening();
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setIsTranslating(false);
      isProcessing.current = false;
      processQueue();
    }
  }, [tier, fromLang, toLang, fromLanguage, toLanguage, autoSpeak, model]);

  const start = useCallback(() => {
    if (!fromLanguage) return;
    setError(null);

    startListening(
      fromLanguage.speechCode,
      (transcript, isFinal) => {
        if (isFinal) {
          setInterimText("");
          translationQueue.current.push(transcript);
          processQueue();
        } else {
          setInterimText(transcript);
        }
      },
      (err) => setError(err)
    );

    setIsListening(true);

    timerRef.current = setInterval(() => {
      setSecondsUsed((prev) => prev + 1);
    }, 1000);
  }, [fromLanguage, processQueue]);

  const stop = useCallback(() => {
    stopListening();
    setIsListening(false);
    setInterimText("");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  const clearHistory = useCallback(() => {
    setEntries([]);
    setSecondsUsed(0);
  }, []);

  return {
    isListening,
    interimText,
    entries,
    isTranslating,
    isSpeaking,
    error,
    secondsUsed,
    toggle,
    start,
    stop,
    clearHistory,
  };
}

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const VOICE_MAP: Record<string, "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"> = {
  en: "nova",
  es: "nova",
  fr: "nova",
  de: "onyx",
  it: "nova",
  pt: "nova",
  ru: "onyx",
  zh: "nova",
  ja: "nova",
  ko: "nova",
  ar: "onyx",
  hi: "nova",
  tr: "onyx",
  pl: "nova",
  nl: "onyx",
  uk: "onyx",
  sv: "nova",
  th: "nova",
  vi: "nova",
  el: "onyx",
};

export async function POST(req: NextRequest) {
  try {
    const { text, langCode } = await req.json();

    if (!text || !langCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (text.length > 2000) {
      return NextResponse.json({ error: "Text too long" }, { status: 400 });
    }

    const voice = VOICE_MAP[langCode] || "nova";

    const mp3 = await getOpenAI().audio.speech.create({
      model: "tts-1",
      voice,
      input: text,
      speed: 1.0,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}

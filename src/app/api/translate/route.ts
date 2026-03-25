import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  try {
    const { text, fromLang, toLang, model } = await req.json();

    if (!text || !fromLang || !toLang) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (text.length > 2000) {
      return NextResponse.json({ error: "Text too long" }, { status: 400 });
    }

    const aiModel = model === "accurate" ? "gpt-4o" : "gpt-4o-mini";

    const completion = await getOpenAI().chat.completions.create({
      model: aiModel,
      temperature: 0.3,
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: `You are a real-time voice translator. Your input comes from speech recognition and may contain errors, missing words, or broken grammar.

Your job:
1. First, reconstruct what the speaker most likely said in ${fromLang} (fix speech recognition errors, fill in obviously missing words, correct grammar)
2. Then translate the corrected text into ${toLang}

Rules:
- Output ONLY the translated text in ${toLang}, nothing else
- Preserve the tone and intent of the original speech
- Keep it natural and conversational
- If the input is clearly a fragment, translate it as a natural fragment
- Do not add explanations, notes, or alternatives
- Never refuse to translate — always give your best interpretation`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const translated = completion.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({ translated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Translation error:", message);
    return NextResponse.json(
      { error: "Translation failed", detail: message },
      { status: 500 }
    );
  }
}

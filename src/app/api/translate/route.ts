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
          content: `You are a real-time voice translator. Translate the following spoken text from ${fromLang} to ${toLang}. Rules:
- Output ONLY the translated text, nothing else
- Preserve the tone and intent of the original speech
- Keep it natural and conversational
- If the input is a fragment or incomplete sentence, translate it as-is
- Do not add explanations, notes, or alternatives`,
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

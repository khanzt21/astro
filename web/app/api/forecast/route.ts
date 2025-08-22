import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ForecastSchema } from "@/lib/gpt/schema";
import { buildSystemPrompt, buildUserPayload } from "@/lib/gpt/prompt";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { locale, question, natal, transits } = await req.json();
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });
    }
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL_ID || "gpt-4o-mini";

    const sys = buildSystemPrompt();
    const user = buildUserPayload({ locale, question, natal, transits });

    const chat = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6
    });

    const text = chat.choices[0]?.message?.content || "{}";
    const parsed = ForecastSchema.safeParse(JSON.parse(text));
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
    }
    return NextResponse.json(parsed.data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}

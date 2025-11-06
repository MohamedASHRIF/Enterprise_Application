import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const GEMINI_API_URL = process.env.GEMINI_API_URL;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_URL || !GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_URL and GEMINI_API_KEY environment variables are required. Set them in .env.local (frontend) or your environment).",
        },
        { status: 500 }
      );
    }

    // Proxy the request to the configured Gemini-like endpoint. The frontend does not
    // encode model-specific payloads here — configure GEMINI_API_URL to accept
    // { prompt } JSON or adapt this code to the provider's required shape.
    const upstreamRes = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const upstreamText = await upstreamRes.text();

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: "Upstream error", details: upstreamText },
        { status: 502 }
      );
    }

    // Try to parse JSON reply; if not JSON, return text as 'reply'
    try {
      const json = JSON.parse(upstreamText);
      // Try common fields
      const reply = json.reply ?? json.output_text ?? json.response ?? json.result ?? json;
      return NextResponse.json({ reply });
    } catch (e) {
      return NextResponse.json({ reply: upstreamText });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

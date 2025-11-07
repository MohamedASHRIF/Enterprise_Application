import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body?.prompt ?? body?.message ?? body?.text;
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // By default proxy to the local backend chatbot service. This avoids requiring
    // GEMINI keys in the browser/dev server. Set NEXT_PUBLIC_CHATBOT_URL to point
    // at a running backend if different.
    const BACKEND_URL = process.env.NEXT_PUBLIC_CHATBOT_URL || "http://localhost:8086/api/chat";

    // Normalize the payload to what the backend expects (message)
    const upstreamRes = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    const upstreamText = await upstreamRes.text();

    if (!upstreamRes.ok) {
      return NextResponse.json({ error: "Upstream error", details: upstreamText }, { status: 502 });
    }

    try {
      const json = JSON.parse(upstreamText);
      // Prefer common reply fields
      const reply = json.reply ?? json.response ?? json.result ?? json.output_text ?? json;
      return NextResponse.json({ reply });
    } catch (e) {
      return NextResponse.json({ reply: upstreamText });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

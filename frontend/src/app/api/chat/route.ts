import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Read raw body once, then attempt to parse as JSON. This avoids consuming the
    // body stream twice (calling req.json() then req.text() can fail).
    const raw = await req.text();
    let body: any = null;
    if (!raw) {
      body = {};
    } else {
      try {
        body = JSON.parse(raw);
      } catch (_parse) {
        // Not valid JSON — treat raw as the prompt text.
        body = { prompt: raw };
      }
    }

    const prompt = body?.prompt ?? body?.message ?? body?.text;
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // By default proxy to the local backend chatbot service. This avoids requiring
    // GEMINI keys in the browser/dev server. Set NEXT_PUBLIC_CHATBOT_URL to point
    // at a running backend if different.
    // Choose backend URL in this order:
    // 1) NEXT_PUBLIC_CHATBOT_URL (browser/build-time override),
    // 2) SERVER_CHATBOT_URL (server-side runtime override in the container),
    // 3) default to service name inside docker compose so the frontend container
    //    can reach the chatbot-backend at runtime, otherwise fall back to localhost
    const BACKEND_URL =
      process.env.NEXT_PUBLIC_CHATBOT_URL ||
      process.env.SERVER_CHATBOT_URL ||
      "http://chatbot-backend:8086/api/chat" ||
      "http://localhost:8086/api/chat";

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
      // If parsing upstream response as JSON failed, return raw text as the reply.
      console.error("Failed to parse upstream response as JSON:", e, "raw:", upstreamText);
      return NextResponse.json({ reply: upstreamText });
    }
  } catch (err: any) {
    console.error("/api/chat handler error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

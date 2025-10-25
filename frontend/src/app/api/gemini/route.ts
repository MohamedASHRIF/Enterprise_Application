export const runtime = "edge";

import { initialMessages } from "../../../../lib/data";

type Message = { id?: string; role: "user" | "assistant" | "system"; content: string };

const buildPrompt = (messages: Message[]) => {
  const system = (initialMessages as any)?.content ?? "You are a helpful assistant.";
  const convo = messages
    .map((m) => (m.role === "user" ? `User: ${m.content}` : `Assistant: ${m.content}`))
    .join("\n");
  return `${system}\n\n${convo}\nAssistant:`;
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    if (!messages.length) {
      return new Response(JSON.stringify({ error: "Missing messages array" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GOOGLE_API_KEY not set on server" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    // Build a single prompt from conversation and call Google Generative Text (text-bison) REST endpoint.
    const promptText = buildPrompt(messages as Message[]);
    const url = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${encodeURIComponent(
      apiKey
    )}`;

    const payload = {
      prompt: { text: promptText },
      temperature: 0.2,
      maxOutputTokens: 512,
    };

    const googleRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!googleRes.ok) {
      const errBody = await googleRes.text().catch(() => "");
      return new Response(JSON.stringify({ error: `Google API error: ${googleRes.status} ${errBody}` }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }

    const data = await googleRes.json().catch(() => null);
    // typical response contains candidates[0].output or candidates[0].content
    const reply =
      data?.candidates?.[0]?.output ||
      data?.candidates?.[0]?.content ||
      data?.output ||
      (typeof data === "string" ? data : JSON.stringify(data));

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("/api/gemini error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Internal error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}


{/*export const runtime = "edge";

import { initialMessages } from "../../../../lib/data";

const generateId = () => Math.random().toString(36).slice(2, 15);

type Message = { id?: string; role: "user" | "assistant" | "system"; content: string };

const buildGoogleGenAIPrompt = (message: Message[]): Message[] => [
  {
    id: generateId(),
    role: "user",
    content: (initialMessages as any)?.content ?? "Hello",
  },
  ...message.map((m) => ({
    id: m.id || generateId(),
    role: m.role,
    content: m.content,
  })),
];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    if (!messages.length) {
      return new Response(JSON.stringify({ error: "Missing messages array in request body" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // dynamic import so build won't fail if SDK exports differ
    const mod = await import("@ai-sdk/google").catch(() => null);

    if (mod && typeof (mod as any).createGoogleGenerativeAI === "function") {
      // adapt to actual SDK API in node_modules if needed
      const { createGoogleGenerativeAI } = mod as any;
      const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY ?? "" });

      // NOTE: adjust to the exact SDK method names / signatures in your installed version
      if (typeof (mod as any).streamText === "function") {
        const { streamText } = mod as any;
        const promptMessages = buildGoogleGenAIPrompt(messages as Message[]);
        const stream = await streamText({
          model: google("gemini-pro"),
          messages: promptMessages,
          temperature: 0.7,
        });
        if (stream instanceof Response) return stream;
        return new Response(stream as any, { headers: { "Content-Type": "text/event-stream" } });
      }

      // fallback: attempt any other SDK call if you know it, otherwise continue to echo fallback
    }

    // Fallback response (development): echo last user message
    const lastUser = [...messages].reverse().find((m: any) => m?.role === "user")?.content || "Hello";
    const reply = `Echo (fallback): ${String(lastUser)}`;

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("/api/gemini error:", err);
    const msg =
      err && /Cannot find module|ERR_MODULE_NOT_FOUND/.test(String(err))
        ? "SDK missing or wrong exports. Install correct package or adapt imports."
        : err?.message ?? "Internal Server Error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { "content-type": "application/json" } });
  }
}*/}
// Simple local fallback API for development.
// Returns a JSON { reply } that echoes the last user message.

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const messages = Array.isArray(body?.messages) ? body.messages : [];

        if (!messages.length) {
            return new Response(JSON.stringify({ error: "Missing messages array in request body" }), {
                status: 400,
                headers: { "content-type": "application/json" },
            });
        }

        const lastUser = [...messages].reverse().find((m: any) => m?.role === "user")?.content || "Hello";
        const reply = `Echo: ${String(lastUser)}`;

        return new Response(JSON.stringify({ reply }), { status: 200, headers: { "content-type": "application/json" } });
    } catch (err) {
        console.error("/api/gemini error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "content-type": "application/json" } });
    }
}
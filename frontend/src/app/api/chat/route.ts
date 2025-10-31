import { NextRequest, NextResponse } from 'next/server';

// Simple proxy to backend chat endpoint to avoid CORS and port mismatches during local dev.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendRes = await fetch('http://localhost:8080/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await backendRes.text();
    return new NextResponse(text, { status: backendRes.status, headers: { 'Content-Type': backendRes.headers.get('content-type') || 'application/json' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('API proxy /api/chat error:', message);
    return NextResponse.json({ error: 'Proxy error', details: message }, { status: 502 });
  }
}

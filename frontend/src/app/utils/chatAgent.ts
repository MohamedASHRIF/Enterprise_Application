interface ChatEntry {
  role: string;
  content: string;
}

export async function chatAgentHandler(userMessage: string, chatHistory: ChatEntry[]) {
  const systemPrompt = `You are a helpful enterprise AI assistant for customer service. You provide professional, clear, and concise responses to help users with bookings, vehicles, appointments, and other tasks.

### Chat History:
${JSON.stringify(chatHistory)}

### Instructions:
- Be professional and courteous
- Provide accurate and helpful information
- Keep responses clear and well-structured
- If you don't know something, be honest about it`;

  const payload = {
    systemPrompt,
    userPrompt: userMessage,
  };

  try {
    const response = await fetch('/api/chat', {  // Use Next.js API route or backend proxy; adjust if needed to full URL like 'http://localhost:8080/api/chat'
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Try to extract any error details from the response body
      let details = '';
      try {
        const text = await response.text();
        if (text) {
          // attempt JSON parse first
          try {
            const parsed = JSON.parse(text);
            details = parsed?.error || parsed?.message || JSON.stringify(parsed);
          } catch (e) {
            details = text;
          }
        }
      } catch (e) {
        details = String(e);
      }
      console.error('chatAgentHandler backend returned non-ok:', response.status, details);
      // Return a friendly fallback message instead of throwing so UI can show it as AI reply
      return `I\'m sorry — the backend returned an error (${response.status}). ${details || ''}`;
    }

    // Response is OK — support both JSON { response: string } and plain text responses
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      // if backend returns { response: '...' }
      if (data && typeof data === 'object') return data.response ?? data?.message ?? JSON.stringify(data);
      return String(data);
    }

    // fallback to text
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Chat agent error:', error);
    // Return a safe message so UI doesn't crash and shows a helpful response
    return "I apologize, but I couldn't reach the chat backend. Please try again later.";
  }
}
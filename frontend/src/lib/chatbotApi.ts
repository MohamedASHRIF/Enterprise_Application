export async function sendChatMessage(message: string): Promise<string> {
  // Backend chatbot runs on port 8086 in this project (see chatbot-backend application.properties).
  const url = process.env.NEXT_PUBLIC_CHATBOT_URL ?? "http://localhost:8086/api/chat";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error("Chatbot request failed");
  }
  const data = await res.json();
  // Expecting { reply: string }
  return data?.reply ?? "(no reply)";
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchAgents() {
  const res = await fetch(`${API_URL}/agents`);
  if (!res.ok) throw new Error(`Failed to load agents (${res.status})`);
  return res.json();
}

export async function postChat(message, sessionId) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`Chat request failed (${res.status})`);
  return res.json();
}

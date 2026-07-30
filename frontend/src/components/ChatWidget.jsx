import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import ChatTable from "./ChatTable.jsx";
import { postChat } from "../api.js";

const WELCOME = {
  role: "assistant",
  content:
    "Hi, I'm the RELAY assistant. Ask me about the agents, their status, or how the pipeline works.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const sessionId = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`
  );
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K to open/close chat
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      // Escape to close chat
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setSending(true);

    try {
      const res = await postChat(text, sessionId.current);
      sessionId.current = res.session_id;
      setMessages((prev) => [...prev, { role: "assistant", content: res.summary, table: res.table }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Couldn't reach the chat backend (${err.message}).` },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-40 flex h-[28rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl sm:right-8 sm:w-96">
          <div className="flex items-center justify-between border-b border-line bg-surface2 px-4 py-3">
            <div>
              <p className="font-display text-sm font-semibold text-text-primary">RELAY assistant</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">
                Rule-based · online
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-signal-amber text-ink"
                      : "border border-line bg-surface2 text-text-primary"
                  }`}
                >
                  {m.content}
                  {m.table && <ChatTable table={m.table} />}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-2 font-mono text-xs text-text-secondary">
                <Loader2 size={14} className="animate-spin" /> thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the pipeline…"
              className="flex-1 rounded-lg border border-line bg-ink px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-signal-amber"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-amber text-ink transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-signal-amber text-ink shadow-glow transition-transform hover:scale-105 sm:right-8"
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>
    </>
  );
}

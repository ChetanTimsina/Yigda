"use client";

import { useEffect, useRef, useState } from "react";

const WELCOME = "Kuzuzangpo La! 🙏 I am the Yigda Assistant, La. I am here to help you with document issuance, verification, sharing, and anything else about the Yigda platform. Please feel free to ask, La — Tashi Delek!";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, messages]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setError("");

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setBusy(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter(m => m.role !== "system") })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function clear() {
    setMessages([{ role: "assistant", content: WELCOME }]);
    setError("");
  }

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "oklch(45% 0.18 195)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.22)",
          transition: "transform 0.18s, background 0.18s",
          transform: open ? "rotate(45deg) scale(1.08)" : "scale(1)"
        }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            right: 28,
            zIndex: 9998,
            width: 360,
            maxWidth: "calc(100vw - 40px)",
            height: 520,
            maxHeight: "calc(100vh - 120px)",
            background: "var(--color-surface, #fff)",
            border: "1px solid oklch(88% 0.01 220)",
            borderRadius: 16,
            boxShadow: "0 8px 40px rgba(0,0,0,0.16)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "var(--font-inter, system-ui, sans-serif)"
          }}
        >
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            background: "oklch(45% 0.18 195)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexShrink: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "oklch(55% 0.18 195)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", lineHeight: 1.2 }}>Yigda Assistant</div>
                <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>Powered by Llama 3.1</div>
              </div>
            </div>
            <button
              onClick={clear}
              title="Clear chat"
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.75)",
                cursor: "pointer",
                padding: 4,
                borderRadius: 6,
                display: "flex",
                alignItems: "center"
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 14px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
                }}
              >
                <div style={{
                  maxWidth: "85%",
                  padding: "9px 13px",
                  borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: msg.role === "user"
                    ? "oklch(45% 0.18 195)"
                    : "oklch(96% 0.005 220)",
                  color: msg.role === "user" ? "#fff" : "oklch(20% 0.01 220)",
                  fontSize: "0.845rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word"
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {busy && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "9px 14px",
                  borderRadius: "14px 14px 14px 4px",
                  background: "oklch(96% 0.005 220)",
                  display: "flex",
                  gap: 5,
                  alignItems: "center"
                }}>
                  {[0, 1, 2].map(n => (
                    <span key={n} style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "oklch(60% 0.10 195)",
                      display: "inline-block",
                      animation: `bounce 1.2s ${n * 0.2}s ease-in-out infinite`
                    }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{
                fontSize: "0.78rem",
                color: "oklch(45% 0.18 25)",
                background: "oklch(97% 0.015 25)",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid oklch(88% 0.04 25)"
              }}>
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "10px 12px",
            borderTop: "1px solid oklch(92% 0.01 220)",
            display: "flex",
            gap: 8,
            flexShrink: 0,
            background: "#fff"
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything about Yigda…"
              rows={1}
              disabled={busy}
              style={{
                flex: 1,
                resize: "none",
                border: "1px solid oklch(88% 0.01 220)",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: "0.845rem",
                fontFamily: "inherit",
                outline: "none",
                lineHeight: 1.5,
                background: busy ? "oklch(97% 0.005 220)" : "#fff",
                color: "oklch(20% 0.01 220)",
                maxHeight: 100,
                overflowY: "auto"
              }}
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "none",
                background: busy || !input.trim() ? "oklch(88% 0.01 220)" : "oklch(45% 0.18 195)",
                color: busy || !input.trim() ? "oklch(60% 0.01 220)" : "#fff",
                cursor: busy || !input.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

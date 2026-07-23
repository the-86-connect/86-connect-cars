"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageCircle, X, Send, Bot, User, Trash2, Copy, Check,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

const STORAGE_KEY = "86connect_chat_history";

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm the 86Connect Cars assistant — here to help you source and export vehicles from China. Ask me about our vehicles, shipping, pricing, or the export process, and I'll answer based on our official knowledge base.",
};

const SUGGESTIONS = [
  "What cars do you export?",
  "How long does shipping take?",
  "What documents are included?",
  "Get a quote for a BYD",
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function loadHistory(): Message[] {
  if (typeof window === "undefined") return [WELCOME];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [WELCOME];
    const parsed = JSON.parse(raw) as Message[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [WELCOME];
    return parsed;
  } catch {
    return [WELCOME];
  }
}

function saveHistory(messages: Message[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* ignore quota errors */
  }
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const didLoad = useRef(false);

  useEffect(() => {
    if (!didLoad.current) {
      didLoad.current = true;
      setMessages(loadHistory());
    }
  }, []);

  useEffect(() => {
    if (didLoad.current) saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  const clearChat = useCallback(() => {
    setMessages([WELCOME]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { id: uid(), role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setMessages([
          ...next,
          {
            id: uid(),
            role: "assistant",
            content:
              "You're sending messages too quickly. Please wait a moment and try again, or reach us directly via WhatsApp at +86 176 1153 3296.",
          },
        ]);
        return;
      }

      setMessages([
        ...next,
        {
          id: uid(),
          role: "assistant",
          content: data.answer || "Sorry, I couldn't generate a response right now.",
        },
      ]);

      if (!open) setUnread(true);
    } catch {
      setMessages([
        ...next,
        {
          id: uid(),
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment, or reach us directly via WhatsApp at +86 176 1153 3296 or email info@the86connect.com.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const hasChat = messages.length > 1;

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close chat" : "Open chat assistant"}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) setUnread(false);
        }}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-brand-500 to-purple-600 text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-105 active:scale-95"
        style={{
          boxShadow: "0 8px 28px rgba(79, 70, 229, 0.35)",
        }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-600" />
        )}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 flex h-[min(600px,calc(100vh-7rem))] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          style={{ boxShadow: "0 20px 60px -15px rgba(0,0,0,0.25)" }}
        >
          {/* Header */}
          <div
            className="relative flex items-center gap-3 px-4 py-3 text-white overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #8b5cf6 100%)",
            }}
          >
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.25) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)",
            }} />
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
              <Bot className="h-5 w-5" />
            </div>
            <div className="relative flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">86Connect Assistant</p>
              <p className="flex items-center gap-1.5 text-xs text-white/90">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {loading ? "Typing..." : "Online — replies instantly"}
              </p>
            </div>
            {hasChat && (
              <button
                type="button"
                onClick={clearChat}
                aria-label="Clear chat history"
                title="Clear chat history"
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto p-4"
            style={{
              background:
                "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)",
            }}
          >
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                onCopy={copy}
                copied={copied}
              />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
                  <Bot className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-sm ring-1 ring-gray-100">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about vehicles, shipping, pricing..."
              maxLength={500}
              disabled={loading}
              className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
              }}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function MessageBubble({
  message,
  onCopy,
  copied,
}: {
  message: Message;
  onCopy: (text: string, key: string) => void;
  copied: string | null;
}) {
  const isUser = message.role === "user";

  const contactInfo = extractContact(message.content);

  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-gray-200 text-gray-600"
            : "bg-white shadow-sm ring-1 ring-indigo-100"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4 text-indigo-600" />
        )}
      </div>
      <div
        className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-sm text-white shadow-sm"
            : "rounded-tl-sm bg-white text-gray-800 shadow-sm ring-1 ring-gray-100"
        }`}
        style={
          isUser
            ? { background: "linear-gradient(135deg, #4f46e5, #6366f1)" }
            : undefined
        }
      >
        {contactInfo ? (
          <div className="space-y-1.5">
            <div className="whitespace-pre-wrap">{contactInfo.before}</div>
            {contactInfo.email && (
              <ContactRow
                label="Email"
                value={contactInfo.email}
                href={`mailto:${contactInfo.email}`}
                onCopy={() => onCopy(contactInfo.email!, `${message.id}-email`)}
                copied={copied === `${message.id}-email`}
              />
            )}
            {contactInfo.phone && (
              <ContactRow
                label="WhatsApp"
                value={contactInfo.phone}
                href={`https://wa.me/${contactInfo.phone.replace(/[\s+]/g, "")}`}
                onCopy={() => onCopy(contactInfo.phone!, `${message.id}-phone`)}
                copied={copied === `${message.id}-phone`}
              />
            )}
            {contactInfo.after && (
              <div className="whitespace-pre-wrap pt-0.5">{contactInfo.after}</div>
            )}
          </div>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
}

function ContactRow({
  label,
  value,
  href,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  href: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-2.5 py-1.5 ring-1 ring-gray-200">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 truncate text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
      >
        {value}
      </a>
      <button
        type="button"
        onClick={onCopy}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

function extractContact(text: string) {
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const phoneMatch = text.match(/\+\d[\d\s-]{7,}\d/);

  if (!emailMatch && !phoneMatch) return null;

  const email = emailMatch?.[0] || null;
  const phone = phoneMatch?.[0] || null;

  const firstMatch = emailMatch && phoneMatch
    ? (emailMatch.index! < phoneMatch.index! ? emailMatch : phoneMatch)
    : (emailMatch || phoneMatch)!;

  const before = text.slice(0, firstMatch.index).replace(/\s*[:：]\s*$/, "").trimEnd();
  const lastMatchEnd = emailMatch && phoneMatch
    ? Math.max(emailMatch.index! + emailMatch[0].length, phoneMatch.index! + phoneMatch[0].length)
    : firstMatch.index! + firstMatch[0].length;
  const after = text.slice(lastMatchEnd).replace(/^\s*[.,]\s*/, "").trimStart();

  return {
    before: before || "",
    after: after || "",
    email,
    phone,
  };
}

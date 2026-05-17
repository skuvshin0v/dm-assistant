"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Proposal } from "@/lib/types";
import ProposalCard from "./ProposalCard";

type Usage = { input_tokens: number; output_tokens: number; cost_rub: number };

type UserMessage = { kind: "user"; text: string };
type ThinkingMessage = { kind: "thinking" };
type ProposalsMessage = {
  kind: "proposals";
  title: string | null;
  proposals: Proposal[];
  messageId: string;
  assistantMessageId: string;
  originalText: string;
  usage?: Usage;
  rawLlm?: unknown;
};
type ConfirmedMessage = { kind: "confirmed"; actions: Proposal[]; usage?: Usage; rawLlm?: unknown };
type EmptyMessage = { kind: "empty"; usage?: Usage; rawLlm?: unknown };
type ErrorMessage = { kind: "error"; text: string };

type ChatMessage =
  | UserMessage
  | ThinkingMessage
  | ProposalsMessage
  | ConfirmedMessage
  | EmptyMessage
  | ErrorMessage;

const THINKING_TEXTS = [
  "Анализирую заметки...",
  "Ищу персонажей и локации...",
  "Сверяю с миром кампании...",
  "Формирую предложения...",
  "Думаю...",
];

function ThinkingIndicator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % THINKING_TEXTS.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block w-1.5 h-1.5 rounded-full animate-bounce"
            style={{ background: "var(--muted)", animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
      <span>{THINKING_TEXTS[index]}</span>
    </div>
  );
}

function MessageMeta({ usage, rawLlm }: { usage?: Usage; rawLlm?: unknown }) {
  const [open, setOpen] = useState(false);
  if (!usage) return null;
  const hasRaw = rawLlm != null;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
        <span>↑ {usage.input_tokens.toLocaleString("ru")} / ↓ {usage.output_tokens.toLocaleString("ru")} токенов</span>
        <span>·</span>
        <span>{usage.cost_rub.toFixed(4)} ₽</span>
        {hasRaw && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="underline underline-offset-2"
            style={{ color: "var(--muted)" }}
          >
            {open ? "скрыть raw" : "raw →"}
          </button>
        )}
      </div>
      {open && hasRaw && (
        <pre
          className="text-xs rounded-lg p-3 overflow-x-auto"
          style={{ background: "var(--background)", color: "var(--foreground)", maxHeight: "300px", overflowY: "auto" }}
        >
          {JSON.stringify(rawLlm, null, 2)}
        </pre>
      )}
    </div>
  );
}

type Props = { worldId: string; campaignId: string; chatId: string };

export default function ChatWindow({ worldId, campaignId, chatId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    document.cookie = `last_chat_url=/worlds/${worldId}/campaigns/${campaignId}/chats/${chatId}; path=/; max-age=${60 * 60 * 24 * 30}`;
  }, [worldId, campaignId, chatId]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState<Set<number>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("messages")
          .select("*")
          .eq("chat_id", chatId)
          .order("created_at", { ascending: true });

        if (!data) return;

        const reconstructed: ChatMessage[] = [];
        for (const row of data) {
          if (row.role === "user") {
            reconstructed.push({ kind: "user", text: row.content });
            continue;
          }
          try {
            const parsed = JSON.parse(row.content);
            if (parsed.type === "empty") {
              reconstructed.push({ kind: "empty", usage: parsed.usage, rawLlm: parsed.raw_llm });
            } else if (parsed.type === "confirmed") {
              reconstructed.push({ kind: "confirmed", actions: parsed.actions ?? [], usage: parsed.usage, rawLlm: parsed.raw_llm });
            } else if (parsed.type === "proposals") {
              reconstructed.push({
                kind: "proposals",
                title: parsed.record_title ?? null,
                proposals: parsed.proposals ?? [],
                messageId: parsed.message_id ?? "",
                assistantMessageId: row.id,
                originalText: parsed.original_text ?? "",
                usage: parsed.usage,
                rawLlm: parsed.raw_llm,
              });
            }
          } catch {
            // skip unparseable assistant messages
          }
        }
        setMessages(reconstructed);
        if (reconstructed.some((m) => m.kind === "proposals")) {
          const pending = reconstructed.filter((m): m is ProposalsMessage => m.kind === "proposals");
          const last = pending[pending.length - 1];
          setAccepted(new Set((last.proposals).map((_, i) => i)));
        }
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();
  }, [chatId]);

  const proposalsIdx = messages.findIndex((m) => m.kind === "proposals");
  const activeProposals = proposalsIdx >= 0 ? (messages[proposalsIdx] as ProposalsMessage) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { kind: "user", text }, { kind: "thinking" }]);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Нет сессии");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text, world_id: worldId, campaign_id: campaignId, chat_id: chatId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Ошибка ${res.status}`);
      }

      const data = await res.json();
      const proposals: Proposal[] = data.proposals || [];
      const usage: Usage | undefined = data.usage;
      const rawLlm: unknown = data.raw_llm;

      setMessages((prev) => {
        const next = prev.filter((m) => m.kind !== "thinking");
        if (proposals.length === 0) return [...next, { kind: "empty", usage, rawLlm }];
        return [
          ...next,
          {
            kind: "proposals",
            title: data.record_title || null,
            proposals,
            messageId: data.message_id,
            assistantMessageId: data.assistant_message_id,
            originalText: text,
            usage,
            rawLlm,
          },
        ];
      });
      setAccepted(new Set(proposals.map((_, i) => i)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Неизвестная ошибка";
      setMessages((prev) => [
        ...prev.filter((m) => m.kind !== "thinking"),
        { kind: "error", text: msg },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!activeProposals) return;
    const acceptedProposals = activeProposals.proposals.filter((_, i) => accepted.has(i));
    if (acceptedProposals.length === 0) {
      setMessages((prev) => prev.filter((_, i) => i !== proposalsIdx));
      return;
    }

    setConfirming(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Нет сессии");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/record/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          accepted_proposals: acceptedProposals,
          world_id: worldId,
          campaign_id: campaignId,
          chat_id: chatId,
          message_id: activeProposals.messageId,
          assistant_message_id: activeProposals.assistantMessageId,
          original_text: activeProposals.originalText,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Ошибка ${res.status}`);
      }

      setMessages((prev) =>
        prev.map((m, i) =>
          i === proposalsIdx ? { kind: "confirmed", actions: acceptedProposals } : m
        )
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Неизвестная ошибка";
      setMessages((prev) => [...prev, { kind: "error", text: msg }]);
    } finally {
      setConfirming(false);
    }
  }

  function handleCancel() {
    setMessages((prev) => prev.filter((_, i) => i !== proposalsIdx));
  }

  function toggleAccepted(index: number) {
    setAccepted((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  const ENTITY_LABELS: Record<string, string> = {
    character: "Персонаж",
    location: "Локация",
    faction: "Фракция",
    item: "Предмет",
  };

  return (
    <div
      className="flex flex-col flex-1 min-h-0 rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {historyLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm" style={{ color: "var(--muted)" }}>Загрузка истории...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-3xl">🎲</p>
              <p className="font-medium">Чат готов</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Напиши заметку о сессии — AI извлечёт персонажей и локации
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            if (msg.kind === "user") {
              return (
                <div key={i} className="flex justify-end">
                  <div
                    className="max-w-[80%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap"
                    style={{ background: "var(--primary)", color: "white" }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            }

            if (msg.kind === "thinking") {
              return (
                <div key={i} className="flex justify-start">
                  <div className="rounded-xl px-4 py-2.5" style={{ background: "var(--background)" }}>
                    <ThinkingIndicator />
                  </div>
                </div>
              );
            }

            if (msg.kind === "empty") {
              return (
                <div key={i} className="px-1">
                  <div className="text-sm" style={{ color: "var(--muted)" }}>
                    AI не нашёл новых сущностей в этом тексте
                  </div>
                  <MessageMeta usage={msg.usage} rawLlm={msg.rawLlm} />
                </div>
              );
            }

            if (msg.kind === "error") {
              return (
                <div key={i} className="px-4 py-2 text-sm text-red-400 bg-red-400/10 rounded-lg">
                  {msg.text}
                </div>
              );
            }

            if (msg.kind === "proposals") {
              return (
                <div key={i} className="space-y-3">
                  {msg.title && (
                    <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                      {msg.title}
                    </p>
                  )}
                  {msg.proposals.map((proposal, pi) => (
                    <ProposalCard
                      key={pi}
                      proposal={proposal}
                      accepted={accepted.has(pi)}
                      onToggle={() => toggleAccepted(pi)}
                    />
                  ))}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleConfirm}
                      disabled={confirming || accepted.size === 0}
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                      style={{ background: "var(--primary)" }}
                    >
                      {confirming ? "Сохранение..." : `Сохранить принятые (${accepted.size})`}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 rounded-lg text-sm border"
                      style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                    >
                      Отменить
                    </button>
                  </div>
                  <MessageMeta usage={msg.usage} rawLlm={msg.rawLlm} />
                </div>
              );
            }

            if (msg.kind === "confirmed") {
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>✅</span>
                    <span>Сохранено в мир</span>
                  </div>
                  <div className="space-y-1 pl-6">
                    {msg.actions.map((action, ai) => (
                      <div key={ai} className="text-sm" style={{ color: "var(--muted)" }}>
                        {action.action === "create" ? "+" : "~"}{" "}
                        {ENTITY_LABELS[action.type] ?? action.type} «{action.name}»
                      </div>
                    ))}
                  </div>
                  <MessageMeta usage={msg.usage} rawLlm={msg.rawLlm} />
                </div>
              );
            }

            return null;
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 px-4 pt-3 pb-1 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          className="px-3 py-1.5 rounded-md text-xs border"
          style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
        >
          📝 Записать
        </button>
        {(["🔍 Найти", "💡 Идеи"] as const).map((mode) => (
          <button
            key={mode}
            disabled
            className="px-3 py-1.5 rounded-md text-xs border opacity-40 cursor-not-allowed"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
          >
            {mode}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 p-4 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!loading && input.trim() && !activeProposals) handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          disabled={loading || !!activeProposals}
          placeholder="Напиши заметку о прошедшей сессии..."
          rows={1}
          className="flex-1 rounded-lg px-4 py-2.5 text-sm border outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-50 resize-none overflow-y-auto"
          style={{
            background: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
            maxHeight: "8rem",
            lineHeight: "1.5rem",
            height: "auto",
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || !!activeProposals}
          className="px-4 py-2.5 rounded-lg text-white text-sm font-medium shrink-0 disabled:opacity-50"
          style={{ background: "var(--primary)" }}
        >
          {loading ? "..." : "Отправить"}
        </button>
      </form>
    </div>
  );
}

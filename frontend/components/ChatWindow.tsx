"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Proposal } from "@/lib/types";
import ProposalCard from "./ProposalCard";

type Props = {
  worldId: string;
  campaignId: string;
  chatId: string;
};

export default function ChatWindow({ worldId, campaignId, chatId }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recordTitle, setRecordTitle] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[] | null>(null);
  const [accepted, setAccepted] = useState<Set<number>>(new Set());
  const [messageId, setMessageId] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmDone, setConfirmDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setProposals(null);
    setConfirmDone(false);

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
        body: JSON.stringify({
          text: input,
          world_id: worldId,
          campaign_id: campaignId,
          chat_id: chatId,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Ошибка ${res.status}`);
      }

      const data = await res.json();
      setRecordTitle(data.record_title || null);
      setProposals(data.proposals || []);
      setMessageId(data.message_id);
      setOriginalText(input);
      setAccepted(new Set((data.proposals || []).map((_: Proposal, i: number) => i)));
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!proposals || !messageId) return;

    const acceptedProposals = proposals.filter((_, i) => accepted.has(i));
    if (acceptedProposals.length === 0) {
      setProposals(null);
      return;
    }

    setConfirming(true);
    setError(null);
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
          message_id: messageId,
          original_text: originalText,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Ошибка ${res.status}`);
      }

      setConfirmDone(true);
      setProposals(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setConfirming(false);
    }
  }

  function toggleAccepted(index: number) {
    setAccepted((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div
      className="flex flex-col flex-1 min-h-0 rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      {/* Messages / proposals area */}
      <div className="flex-1 overflow-y-auto p-6">
        {confirmDone ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-3xl">✅</p>
              <p className="font-medium">Сохранено</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Сущности добавлены в мир
              </p>
            </div>
          </div>
        ) : proposals ? (
          <div className="space-y-4">
            {recordTitle && (
              <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                {recordTitle}
              </p>
            )}
            {proposals.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                AI не нашёл новых сущностей в этом тексте
              </p>
            ) : (
              <>
                {proposals.map((proposal, i) => (
                  <ProposalCard
                    key={i}
                    proposal={proposal}
                    accepted={accepted.has(i)}
                    onToggle={() => toggleAccepted(i)}
                  />
                ))}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleConfirm}
                    disabled={confirming || accepted.size === 0}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                    style={{ background: "var(--primary)" }}
                  >
                    {confirming ? "Сохранение..." : `Сохранить принятые (${accepted.size})`}
                  </button>
                  <button
                    onClick={() => setProposals(null)}
                    className="px-4 py-2 rounded-lg text-sm border"
                    style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                  >
                    Отменить
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-3xl">🎲</p>
              <p className="font-medium">Чат готов</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Напиши заметку о сессии — AI извлечёт персонажей и локации
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="px-4 py-2 text-sm text-red-400 bg-red-400/10 mx-4 mb-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Mode buttons */}
      <div
        className="flex gap-2 px-4 pt-3 pb-1 border-t"
        style={{ borderColor: "var(--border)" }}
      >
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

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3 p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || !!proposals}
          placeholder="Напиши заметку о прошедшей сессии..."
          className="flex-1 rounded-lg px-4 py-2.5 text-sm border outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-50"
          style={{
            background: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || !!proposals}
          className="px-4 py-2.5 rounded-lg text-white text-sm font-medium shrink-0 disabled:opacity-50"
          style={{ background: "var(--primary)" }}
        >
          {loading ? "..." : "Отправить"}
        </button>
      </form>
    </div>
  );
}

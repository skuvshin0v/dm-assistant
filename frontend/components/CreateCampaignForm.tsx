"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function CreateCampaignForm({ worldId }: { worldId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert({ world_id: worldId, name: name.trim(), description: description.trim() || null })
      .select()
      .single();

    if (campaignError || !campaign) {
      setError(campaignError?.message ?? "Ошибка создания кампании");
      setLoading(false);
      return;
    }

    // Auto-create the first chat
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert({ world_id: worldId, campaign_id: campaign.id, title: "Общий чат" })
      .select()
      .single();

    if (chatError || !chat) {
      setError(chatError?.message ?? "Ошибка создания чата");
      setLoading(false);
      return;
    }

    router.push(`/worlds/${worldId}/campaigns/${campaign.id}/chats/${chat.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          Название *
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Тень над Корнхеймом"
          className="w-full rounded-lg px-3 py-2 text-sm border outline-none focus:border-[var(--primary)] transition-colors"
          style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          Описание
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Городская кампания в духе нуар..."
          className="w-full rounded-lg px-3 py-2 text-sm border outline-none focus:border-[var(--primary)] transition-colors resize-none"
          style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-50 transition-opacity"
          style={{ background: "var(--primary)" }}
        >
          {loading ? "Создаю..." : "Создать кампанию"}
        </button>
        <Link
          href={`/worlds/${worldId}/campaigns`}
          className="px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-white/5"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}

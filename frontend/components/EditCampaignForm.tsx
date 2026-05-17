"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { Campaign } from "@/lib/types";

export default function EditCampaignForm({
  campaign,
  worldId,
}: {
  campaign: Campaign;
  worldId: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(campaign.name);
  const [description, setDescription] = useState(campaign.description ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("campaigns")
      .update({ name: name.trim(), description: description.trim() || null })
      .eq("id", campaign.id);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/worlds/${worldId}/campaigns/${campaign.id}/chats`);
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
          {loading ? "Сохраняю..." : "Сохранить"}
        </button>
        <Link
          href={`/worlds/${worldId}/campaigns/${campaign.id}/chats`}
          className="px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-white/5"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}

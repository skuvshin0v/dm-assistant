"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = { worldId: string; campaignId: string };

export default function NewChatButton({ worldId, campaignId }: Props) {
  const router = useRouter();

  async function handleCreate() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("chats")
      .insert({ world_id: worldId, campaign_id: campaignId, title: null })
      .select("id")
      .single();

    if (error || !data) return;

    router.push(`/worlds/${worldId}/campaigns/${campaignId}/chats/${data.id}`);
    router.refresh();
  }

  return (
    <button
      onClick={handleCreate}
      className="text-xs px-2 py-1 rounded-md transition-colors hover:bg-white/5"
      style={{ color: "var(--primary)", border: `1px solid var(--primary)40` }}
      title="Новый чат"
    >
      +
    </button>
  );
}

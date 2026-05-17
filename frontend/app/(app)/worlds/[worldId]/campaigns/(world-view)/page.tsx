import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { World, Campaign } from "@/lib/types";
import CampaignCard from "@/components/CampaignCard";

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ worldId: string }>;
}) {
  const { worldId } = await params;
  const supabase = await createClient();

  const { data: world } = await supabase
    .from("worlds")
    .select("*")
    .eq("id", worldId)
    .single();

  if (!world) notFound();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("world_id", worldId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{(world as World).name}</h1>
        <Link
          href={`/worlds/${worldId}/campaigns/new`}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ background: "var(--primary)" }}
        >
          + Новая кампания
        </Link>
      </div>

      {!campaigns?.length && (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <p className="text-4xl mb-4">📜</p>
          <p className="font-medium">Нет кампаний</p>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Создай первую кампанию в этом мире
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(campaigns as Campaign[])?.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} worldId={worldId} />
        ))}
      </div>
    </div>
  );
}

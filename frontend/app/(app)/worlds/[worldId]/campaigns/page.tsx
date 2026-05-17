import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { World, Campaign } from "@/lib/types";
import Breadcrumb from "@/components/Breadcrumb";

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
      <Breadcrumb items={[{ label: "Миры", href: "/worlds" }, { label: (world as World).name }]} />

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
          <Link
            key={campaign.id}
            href={`/worlds/${worldId}/campaigns/${campaign.id}/chats`}
            className="rounded-xl border p-6 space-y-2 transition-colors hover:border-[var(--primary)]/40"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <h2 className="font-semibold text-lg">{campaign.name}</h2>
            {campaign.description && (
              <p className="text-sm line-clamp-2" style={{ color: "var(--muted)" }}>
                {campaign.description}
              </p>
            )}
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Создана {new Date(campaign.created_at).toLocaleDateString("ru-RU")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { World, Campaign, Chat } from "@/lib/types";
import Breadcrumb from "@/components/Breadcrumb";

export default async function ChatsPage({
  params,
}: {
  params: Promise<{ worldId: string; campaignId: string }>;
}) {
  const { worldId, campaignId } = await params;
  const supabase = await createClient();

  const [{ data: world }, { data: campaign }, { data: chats }] = await Promise.all([
    supabase.from("worlds").select("*").eq("id", worldId).single(),
    supabase.from("campaigns").select("*").eq("id", campaignId).single(),
    supabase.from("chats").select("*").eq("campaign_id", campaignId).order("created_at"),
  ]);

  if (!world || !campaign) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Миры", href: "/worlds" },
          { label: (world as World).name, href: `/worlds/${worldId}/campaigns` },
          { label: (campaign as Campaign).name },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{(campaign as Campaign).name}</h1>
        <Link
          href={`/worlds/${worldId}/campaigns/${campaignId}/canon`}
          className="px-4 py-2 rounded-lg text-sm border transition-colors hover:bg-white/5"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          📚 Канон
        </Link>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          Чаты
        </h2>
        {!chats?.length && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>Нет чатов.</p>
        )}
        {(chats as Chat[])?.map((chat) => (
          <Link
            key={chat.id}
            href={`/worlds/${worldId}/campaigns/${campaignId}/chats/${chat.id}`}
            className="flex items-center gap-3 rounded-xl border px-5 py-4 transition-colors hover:border-[var(--primary)]/40"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <span className="text-lg">💬</span>
            <span className="font-medium">{chat.title ?? "Чат"}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

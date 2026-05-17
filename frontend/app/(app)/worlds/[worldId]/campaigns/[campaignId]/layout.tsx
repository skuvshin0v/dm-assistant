import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import type { World, Campaign, Chat } from "@/lib/types";

export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ worldId: string; campaignId: string }>;
}) {
  const { worldId, campaignId } = await params;
  const supabase = await createClient();

  const [{ data: campaign }, { data: world }, { data: chats }] = await Promise.all([
    supabase.from("campaigns").select("*").eq("id", campaignId).single(),
    supabase.from("worlds").select("*").eq("id", worldId).single(),
    supabase
      .from("chats")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false }),
  ]);

  if (!campaign || !world) notFound();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <Sidebar
        mode="campaign"
        worldId={worldId}
        worldName={(world as World).name}
        campaignId={campaignId}
        campaignName={(campaign as Campaign).name}
        chats={(chats as Chat[]) ?? []}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

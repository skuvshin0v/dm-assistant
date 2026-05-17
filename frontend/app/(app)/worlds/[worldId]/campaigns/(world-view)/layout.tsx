import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import type { World } from "@/lib/types";

export default async function WorldCampaignsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <Sidebar mode="world" worldId={worldId} worldName={(world as World).name} />
      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}

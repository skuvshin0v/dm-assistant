import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { World, Campaign, Chat } from "@/lib/types";
import Breadcrumb from "@/components/Breadcrumb";
import ChatWindow from "@/components/ChatWindow";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ worldId: string; campaignId: string; chatId: string }>;
}) {
  const { worldId, campaignId, chatId } = await params;
  const supabase = await createClient();

  const [{ data: world }, { data: campaign }, { data: chat }] = await Promise.all([
    supabase.from("worlds").select("*").eq("id", worldId).single(),
    supabase.from("campaigns").select("*").eq("id", campaignId).single(),
    supabase.from("chats").select("*").eq("id", chatId).single(),
  ]);

  if (!world || !campaign || !chat) notFound();

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
      <Breadcrumb
        items={[
          { label: "Миры", href: "/worlds" },
          { label: (world as World).name, href: `/worlds/${worldId}/campaigns` },
          { label: (campaign as Campaign).name, href: `/worlds/${worldId}/campaigns/${campaignId}/chats` },
          { label: (chat as Chat).title ?? "Чат" },
        ]}
      />
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold">{(chat as Chat).title ?? "Чат"}</h1>
        <a
          href={`/worlds/${worldId}/campaigns/${campaignId}/canon`}
          className="text-sm px-3 py-1.5 rounded-md border transition-colors hover:bg-white/5"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          📚 Канон
        </a>
      </div>
      <ChatWindow />
    </div>
  );
}

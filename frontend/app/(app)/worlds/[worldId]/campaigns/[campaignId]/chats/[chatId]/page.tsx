import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ worldId: string; campaignId: string; chatId: string }>;
}) {
  const { worldId, campaignId, chatId } = await params;
  const supabase = await createClient();

  const { data: chat } = await supabase.from("chats").select("*").eq("id", chatId).single();

  if (!chat) notFound();

  return (
    <div className="flex flex-col h-screen p-4">
      <ChatWindow
        worldId={worldId}
        campaignId={campaignId}
        chatId={chatId}
        chatTitle={chat.title ?? "Чат"}
      />
    </div>
  );
}

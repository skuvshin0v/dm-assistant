import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ChatsPage({
  params,
}: {
  params: Promise<{ worldId: string; campaignId: string }>;
}) {
  const { worldId, campaignId } = await params;
  const supabase = await createClient();

  const { data: latest } = await supabase
    .from("chats")
    .select("id")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (latest) {
    redirect(`/worlds/${worldId}/campaigns/${campaignId}/chats/${latest.id}`);
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-3">
        <p className="text-3xl">💬</p>
        <p className="font-medium">Нет чатов</p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Создайте первый чат через панель слева
        </p>
      </div>
    </div>
  );
}

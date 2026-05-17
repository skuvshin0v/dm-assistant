import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Campaign } from "@/lib/types";
import EditCampaignForm from "@/components/EditCampaignForm";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ worldId: string; campaignId: string }>;
}) {
  const { worldId, campaignId } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (!campaign) notFound();

  return (
    <div className="px-8 py-8 max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Изменить кампанию</h1>
      <EditCampaignForm campaign={campaign as Campaign} worldId={worldId} />
    </div>
  );
}

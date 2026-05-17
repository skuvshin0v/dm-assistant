import CreateCampaignForm from "@/components/CreateCampaignForm";
import Breadcrumb from "@/components/Breadcrumb";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { World } from "@/lib/types";

export default async function NewCampaignPage({
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

  return (
    <div className="max-w-lg space-y-6">
      <Breadcrumb
        items={[
          { label: "Миры", href: "/worlds" },
          { label: (world as World).name, href: `/worlds/${worldId}/campaigns` },
          { label: "Новая кампания" },
        ]}
      />
      <h1 className="text-2xl font-bold">Новая кампания</h1>
      <CreateCampaignForm worldId={worldId} />
    </div>
  );
}

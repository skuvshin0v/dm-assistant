import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { World, Campaign } from "@/lib/types";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

export default async function CanonPage({
  params,
}: {
  params: Promise<{ worldId: string; campaignId: string }>;
}) {
  const { worldId, campaignId } = await params;
  const supabase = await createClient();

  const [{ data: world }, { data: campaign }] = await Promise.all([
    supabase.from("worlds").select("*").eq("id", worldId).single(),
    supabase.from("campaigns").select("*").eq("id", campaignId).single(),
  ]);

  if (!world || !campaign) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Миры", href: "/worlds" },
          { label: (world as World).name, href: `/worlds/${worldId}/campaigns` },
          { label: (campaign as Campaign).name, href: `/worlds/${worldId}/campaigns/${campaignId}/chats` },
          { label: "Канон" },
        ]}
      />

      <h1 className="text-2xl font-bold">Канон кампании</h1>

      <div
        className="rounded-xl border p-16 text-center space-y-4"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <p className="text-5xl">📚</p>
        <p className="font-semibold text-lg">Раздел пока пустой</p>
        <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--muted)" }}>
          Здесь будут сущности твоего мира — персонажи, локации, фракции и предметы.
          Они появятся после первой записи в чате.
        </p>
        <Link
          href={`/worlds/${worldId}/campaigns/${campaignId}/chats`}
          className="inline-block mt-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium"
          style={{ background: "var(--primary)" }}
        >
          Перейти в чат
        </Link>
      </div>
    </div>
  );
}

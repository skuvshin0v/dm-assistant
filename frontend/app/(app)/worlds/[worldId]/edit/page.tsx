import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { World } from "@/lib/types";
import Sidebar from "@/components/Sidebar";
import EditWorldForm from "@/components/EditWorldForm";

export default async function EditWorldPage({
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
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <Sidebar mode="root" />
      <main className="flex-1 overflow-y-auto px-8 py-8 max-w-lg space-y-6">
        <h1 className="text-2xl font-bold">Изменить мир</h1>
        <EditWorldForm world={world as World} />
      </main>
    </div>
  );
}

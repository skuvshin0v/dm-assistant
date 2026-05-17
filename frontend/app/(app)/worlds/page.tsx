import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { World } from "@/lib/types";
import Sidebar from "@/components/Sidebar";
import WorldCard from "@/components/WorldCard";

export default async function WorldsPage() {
  const supabase = await createClient();
  const { data: worlds } = await supabase
    .from("worlds")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <Sidebar mode="root" />
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Мои миры</h1>
            <Link
              href="/worlds/new"
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: "var(--primary)" }}
            >
              + Новый мир
            </Link>
          </div>

          {!worlds?.length && (
            <div
              className="rounded-xl border p-12 text-center"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              <p className="text-4xl mb-4">🌍</p>
              <p className="font-medium">Нет миров</p>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                Создай первый мир, чтобы начать
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(worlds as World[])?.map((world) => (
              <WorldCard key={world.id} world={world} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

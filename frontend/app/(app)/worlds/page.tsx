import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { World } from "@/lib/types";

export default async function WorldsPage() {
  const supabase = await createClient();
  const { data: worlds } = await supabase
    .from("worlds")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
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
          <Link
            key={world.id}
            href={`/worlds/${world.id}/campaigns`}
            className="rounded-xl border p-6 space-y-2 transition-colors hover:border-[var(--primary)]/40"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <h2 className="font-semibold text-lg">{world.name}</h2>
            {world.description && (
              <p className="text-sm line-clamp-2" style={{ color: "var(--muted)" }}>
                {world.description}
              </p>
            )}
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Создан {new Date(world.created_at).toLocaleDateString("ru-RU")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

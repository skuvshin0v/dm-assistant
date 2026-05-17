"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { World } from "@/lib/types";

export default function WorldCard({ world }: { world: World }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Удалить мир «${world.name}»? Это действие нельзя отменить.`)) return;
    const supabase = createClient();
    await supabase.from("worlds").delete().eq("id", world.id);
    router.refresh();
  }

  return (
    <div
      className="group relative rounded-xl border p-6 space-y-2 transition-colors hover:border-[var(--primary)]/40"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <Link href={`/worlds/${world.id}/campaigns`} className="block space-y-2">
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

      <div className="absolute top-3 right-3 hidden group-hover:flex gap-1">
        <Link
          href={`/worlds/${world.id}/edit`}
          onClick={(e) => e.stopPropagation()}
          className="px-2 py-1 rounded text-xs border transition-colors hover:bg-white/5"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          Изменить
        </Link>
        <button
          onClick={(e) => { e.preventDefault(); handleDelete(); }}
          className="px-2 py-1 rounded text-xs border transition-colors hover:bg-red-500/10 hover:border-red-500/50"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          Удалить
        </button>
      </div>
    </div>
  );
}

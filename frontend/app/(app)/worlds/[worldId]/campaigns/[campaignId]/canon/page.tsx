import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { World, Campaign, Character, Location, Faction, Item, EntityType } from "@/lib/types";

const SECTION_CONFIG: {
  type: EntityType;
  label: string;
  icon: string;
  emptyLabel: string;
}[] = [
  { type: "character", label: "Персонажи", icon: "👤", emptyLabel: "Персонажей нет" },
  { type: "location", label: "Локации", icon: "📍", emptyLabel: "Локаций нет" },
  { type: "faction", label: "Фракции", icon: "⚔️", emptyLabel: "Фракций нет" },
  { type: "item", label: "Предметы", icon: "🗡️", emptyLabel: "Предметов нет" },
];

type AnyEntity = { id: string; name: string; description: string | null; visibility: string; status?: string | null };

function metaFields(type: EntityType, entity: AnyEntity): { label: string; value: string }[] {
  const fields: { label: string; value: string }[] = [];
  if (type === "character") {
    const c = entity as Character;
    if (c.role && c.role !== "unknown") fields.push({ label: "Роль", value: c.role === "player" ? "Игрок" : "NPC" });
    if (c.species && c.species !== "unknown") fields.push({ label: "Раса", value: c.species });
    if (c.npc_kind) fields.push({ label: "Тип", value: c.npc_kind });
    if (c.titles?.length) fields.push({ label: "Титул", value: c.titles.join(", ") });
  } else if (type === "location") {
    const l = entity as Location;
    if (l.level) fields.push({ label: "Уровень", value: l.level });
    if (l.subtype) fields.push({ label: "Тип", value: l.subtype });
    if (l.terrain_type) fields.push({ label: "Рельеф", value: l.terrain_type });
  } else if (type === "faction") {
    const f = entity as Faction;
    if (f.kind) fields.push({ label: "Тип", value: f.kind });
    if (f.scale) fields.push({ label: "Масштаб", value: f.scale });
    if (f.goals?.length) fields.push({ label: "Цель", value: f.goals[0] });
  } else if (type === "item") {
    const i = entity as Item;
    if (i.kind === "artifact") fields.push({ label: "Тип", value: "Артефакт" });
    if (i.held_by_party) fields.push({ label: "У партии", value: "да" });
    if (i.aliases?.length) fields.push({ label: "Прозвища", value: i.aliases.join(", ") });
  }
  return fields.slice(0, 3);
}

function EntityCard({ entity, type }: { entity: AnyEntity; type: EntityType }) {
  const isSecret = entity.visibility === "gm_only";
  const meta = metaFields(type, entity);

  return (
    <div
      className="rounded-xl border p-4 space-y-2"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-sm leading-snug">{entity.name}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {entity.status && entity.status !== "alive" && entity.status !== "active" && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: "var(--muted)22", color: "var(--muted)" }}
            >
              {entity.status}
            </span>
          )}
          {isSecret && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: "#ef444422", color: "#ef4444" }}
              title="Только мастер"
            >
              🔒 GM
            </span>
          )}
        </div>
      </div>

      {entity.description && (
        <p
          className="text-xs line-clamp-2 leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          {entity.description}
        </p>
      )}

      {meta.length > 0 && (
        <dl className="space-y-0.5">
          {meta.map((f) => (
            <div key={f.label} className="flex gap-1.5 text-xs">
              <dt style={{ color: "var(--muted)", flexShrink: 0 }}>{f.label}:</dt>
              <dd style={{ color: "var(--foreground)" }}>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function EntitySection({
  type,
  label,
  icon,
  emptyLabel,
  entities,
}: {
  type: EntityType;
  label: string;
  icon: string;
  emptyLabel: string;
  entities: AnyEntity[];
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <h2 className="font-semibold text-sm uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          {label}
        </h2>
        {entities.length > 0 && (
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{ background: "var(--primary)22", color: "var(--primary)" }}
          >
            {entities.length}
          </span>
        )}
      </div>

      {entities.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {emptyLabel}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entities.map((e) => (
            <EntityCard key={e.id} entity={e} type={type} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function CanonPage({
  params,
}: {
  params: Promise<{ worldId: string; campaignId: string }>;
}) {
  const { worldId, campaignId } = await params;
  const supabase = await createClient();

  const [
    { data: world },
    { data: campaign },
    { data: characters },
    { data: locations },
    { data: factions },
    { data: items },
  ] = await Promise.all([
    supabase.from("worlds").select("*").eq("id", worldId).single(),
    supabase.from("campaigns").select("*").eq("id", campaignId).single(),
    supabase.from("characters").select("*").eq("world_id", worldId).order("name"),
    supabase.from("locations").select("*").eq("world_id", worldId).order("name"),
    supabase.from("factions").select("*").eq("world_id", worldId).order("name"),
    supabase.from("items").select("*").eq("world_id", worldId).order("name"),
  ]);

  if (!world || !campaign) notFound();

  const allEmpty =
    !characters?.length && !locations?.length && !factions?.length && !items?.length;

  const entityMap: Record<EntityType, AnyEntity[]> = {
    character: (characters as Character[]) ?? [],
    location: (locations as Location[]) ?? [],
    faction: (factions as Faction[]) ?? [],
    item: (items as Item[]) ?? [],
  };

  const totalCount = Object.values(entityMap).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-8 px-8 py-8">
      <div>
        <h1 className="text-2xl font-bold">Канон мира</h1>
        {!allEmpty && (
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {totalCount} {totalCount === 1 ? "сущность" : totalCount < 5 ? "сущности" : "сущностей"}
          </p>
        )}
      </div>

      {allEmpty ? (
        <div
          className="rounded-xl border p-16 text-center space-y-4"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <p className="text-5xl">📚</p>
          <p className="font-semibold text-lg">Мир пока пустой</p>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--muted)" }}>
            Персонажи, локации, фракции и предметы появятся после первой записи в чате.
          </p>
          <Link
            href={`/worlds/${worldId}/campaigns/${campaignId}/chats`}
            className="inline-block mt-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium"
            style={{ background: "var(--primary)" }}
          >
            Перейти в чат
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {SECTION_CONFIG.map((s) => (
            <EntitySection
              key={s.type}
              type={s.type}
              label={s.label}
              icon={s.icon}
              emptyLabel={s.emptyLabel}
              entities={entityMap[s.type]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

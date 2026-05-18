"use client";

import type React from "react";
import { Proposal, EntityType } from "@/lib/types";
import Icon from "./Icon";

const TYPE_ICON: Record<EntityType, React.ComponentProps<typeof Icon>["name"]> = {
  character: "user",
  location: "map-pin",
  faction: "sword",
  item: "box",
};

const TYPE_LABEL: Record<EntityType, string> = {
  character: "Персонаж",
  location: "Локация",
  faction: "Фракция",
  item: "Предмет",
};

type Field = { label: string; value: string };

function characterFields(p: Proposal): Field[] {
  const d = p.data;
  const fields: Field[] = [];
  if (p.status) fields.push({ label: "Статус", value: p.status });
  if (d.role && d.role !== "npc") fields.push({ label: "Роль", value: String(d.role) });
  if (d.species && d.species !== "unknown") fields.push({ label: "Раса", value: String(d.species) });
  if (d.npc_kind) fields.push({ label: "Тип NPC", value: String(d.npc_kind) });
  if (arr(d.titles)) fields.push({ label: "Титулы", value: arr(d.titles)! });
  if (arr(d.aliases)) fields.push({ label: "Прозвища", value: arr(d.aliases)! });
  if (d.current_location_name) fields.push({ label: "Локация", value: String(d.current_location_name) });
  if (d.origin_location_name) fields.push({ label: "Происхождение", value: String(d.origin_location_name) });
  if (arr(d.affiliation_faction_names)) fields.push({ label: "Фракции", value: arr(d.affiliation_faction_names)! });
  if (arr(d.key_facts)) fields.push({ label: "Факты", value: arr(d.key_facts)! });
  return fields;
}

function locationFields(p: Proposal): Field[] {
  const d = p.data;
  const fields: Field[] = [];
  if (p.status) fields.push({ label: "Статус", value: p.status });
  if (d.level) fields.push({ label: "Уровень", value: String(d.level) });
  if (d.subtype) fields.push({ label: "Подтип", value: String(d.subtype) });
  if (d.terrain_type) fields.push({ label: "Рельеф", value: String(d.terrain_type) });
  if (d.parent_location_name) fields.push({ label: "Входит в", value: String(d.parent_location_name) });
  if (d.controlled_by_faction_name) fields.push({ label: "Контролирует", value: String(d.controlled_by_faction_name) });
  return fields;
}

function factionFields(p: Proposal): Field[] {
  const d = p.data;
  const fields: Field[] = [];
  if (p.status) fields.push({ label: "Статус", value: p.status });
  if (d.kind) fields.push({ label: "Тип", value: String(d.kind) });
  if (d.scale) fields.push({ label: "Масштаб", value: String(d.scale) });
  if (d.headquarters_location_name) fields.push({ label: "Штаб", value: String(d.headquarters_location_name) });
  if (arr(d.leader_character_names)) fields.push({ label: "Лидеры", value: arr(d.leader_character_names)! });
  if (arr(d.goals)) fields.push({ label: "Цели", value: arr(d.goals)! });
  return fields;
}

function itemFields(p: Proposal): Field[] {
  const d = p.data;
  const fields: Field[] = [];
  if (p.status) fields.push({ label: "Статус", value: p.status });
  if (d.kind && d.kind !== "item") fields.push({ label: "Тип", value: String(d.kind) });
  if (arr(d.aliases)) fields.push({ label: "Прозвища", value: arr(d.aliases)! });
  if (d.owner_character_name) fields.push({ label: "Владелец", value: String(d.owner_character_name) });
  if (d.owner_faction_name) fields.push({ label: "Фракция-владелец", value: String(d.owner_faction_name) });
  if (d.current_location_name) fields.push({ label: "Локация", value: String(d.current_location_name) });
  if (d.held_by_party === true) fields.push({ label: "У партии", value: "да" });
  if (arr(d.key_facts)) fields.push({ label: "Факты", value: arr(d.key_facts)! });
  return fields;
}

function arr(v: unknown): string | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  return v.map(String).join(", ");
}

const FIELDS_BY_TYPE: Record<EntityType, (p: Proposal) => Field[]> = {
  character: characterFields,
  location: locationFields,
  faction: factionFields,
  item: itemFields,
};

type Props = {
  proposal: Proposal;
  accepted: boolean;
  onToggle: () => void;
};

export default function ProposalCard({ proposal, accepted, onToggle }: Props) {
  const extraFields = FIELDS_BY_TYPE[proposal.type](proposal);

  return (
    <div
      className="rounded-lg border p-4 flex gap-3 transition-opacity"
      style={{
        borderColor: accepted ? "var(--primary)" : "var(--border)",
        background: "var(--background)",
        opacity: accepted ? 1 : 0.5,
      }}
    >
      <Icon name={TYPE_ICON[proposal.type]} className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{proposal.name}</span>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              background: proposal.action === "create" ? "var(--primary)22" : "orange22",
              color: proposal.action === "create" ? "var(--primary)" : "#f97316",
            }}
          >
            {proposal.action === "create" ? "Новый" : "Обновить"}
          </span>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {TYPE_LABEL[proposal.type]}
          </span>
        </div>

        {proposal.description && (
          <p className="text-sm mt-1.5" style={{ color: "var(--foreground)" }}>
            {proposal.description}
          </p>
        )}

        {extraFields.length > 0 && (
          <dl className="mt-2 space-y-0.5">
            {extraFields.map((f) => (
              <div key={f.label} className="flex gap-1.5 text-xs">
                <dt style={{ color: "var(--muted)", flexShrink: 0 }}>{f.label}:</dt>
                <dd style={{ color: "var(--foreground)" }}>{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <button
        onClick={onToggle}
        className="shrink-0 self-start text-xs px-3 py-1.5 rounded-md border transition-colors"
        style={{
          borderColor: accepted ? "var(--primary)" : "var(--border)",
          color: accepted ? "var(--primary)" : "var(--muted)",
        }}
      >
        {accepted ? (
          <span className="inline-flex items-center gap-1">
            <Icon name="check" className="h-3 w-3" />
            Принят
          </span>
        ) : (
          "Отклонён"
        )}
      </button>
    </div>
  );
}

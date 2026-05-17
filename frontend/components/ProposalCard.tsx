"use client";

import { Proposal, EntityType } from "@/lib/types";

const TYPE_ICON: Record<EntityType, string> = {
  character: "👤",
  location: "📍",
  faction: "⚔️",
  item: "🗡️",
};

const TYPE_LABEL: Record<EntityType, string> = {
  character: "Персонаж",
  location: "Локация",
  faction: "Фракция",
  item: "Предмет",
};

type Props = {
  proposal: Proposal;
  accepted: boolean;
  onToggle: () => void;
};

export default function ProposalCard({ proposal, accepted, onToggle }: Props) {
  return (
    <div
      className="rounded-lg border p-4 flex gap-3 transition-opacity"
      style={{
        borderColor: accepted ? "var(--primary)" : "var(--border)",
        background: "var(--background)",
        opacity: accepted ? 1 : 0.5,
      }}
    >
      <span className="text-xl shrink-0 mt-0.5">{TYPE_ICON[proposal.type]}</span>
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
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {proposal.description}
          </p>
        )}
      </div>
      <button
        onClick={onToggle}
        className="shrink-0 text-xs px-3 py-1.5 rounded-md border transition-colors"
        style={{
          borderColor: accepted ? "var(--primary)" : "var(--border)",
          color: accepted ? "var(--primary)" : "var(--muted)",
        }}
      >
        {accepted ? "✓ Принят" : "Отклонён"}
      </button>
    </div>
  );
}

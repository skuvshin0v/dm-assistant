"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "./LogoutButton";
import NewChatButton from "./NewChatButton";
import type { Chat } from "@/lib/types";

type RootMode = {
  mode: "root";
};

type WorldMode = {
  mode: "world";
  worldId: string;
  worldName: string;
};

type CampaignMode = {
  mode: "campaign";
  worldId: string;
  worldName: string;
  campaignId: string;
  campaignName: string;
  chats: Chat[];
};

type Props = RootMode | WorldMode | CampaignMode;

function NavItem({
  href,
  icon,
  label,
  disabled,
  active,
}: {
  href?: string;
  icon: string;
  label: string;
  disabled?: boolean;
  active?: boolean;
}) {
  const base =
    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left";

  if (disabled) {
    return (
      <div
        className={`${base} opacity-40 cursor-not-allowed`}
        style={{ color: "var(--muted)" }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={href!}
      className={`${base} ${active ? "font-medium" : "hover:bg-white/5"}`}
      style={active ? { background: "var(--primary)18", color: "var(--primary)" } : { color: "var(--foreground)" }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function ChatItem({
  chat,
  worldId,
  campaignId,
  isActive,
}: {
  chat: Chat;
  worldId: string;
  campaignId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chat.title ?? "Чат");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function saveRename() {
    const trimmed = title.trim();
    if (!trimmed || trimmed === (chat.title ?? "Чат")) { setEditing(false); return; }
    const supabase = createClient();
    await supabase.from("chats").update({ title: trimmed }).eq("id", chat.id);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Удалить чат «${chat.title ?? "Чат"}»?`)) return;
    const supabase = createClient();
    await supabase.from("chats").delete().eq("id", chat.id);
    if (pathname.includes(chat.id)) {
      router.push(`/worlds/${worldId}/campaigns/${campaignId}/chats`);
    }
    router.refresh();
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 px-3 py-1.5">
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") setEditing(false); }}
          onBlur={saveRename}
          className="flex-1 min-w-0 rounded px-1.5 py-0.5 text-sm border outline-none focus:border-[var(--primary)]"
          style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-1 rounded-lg transition-colors"
      style={isActive ? { background: "var(--primary)18" } : {}}>
      <Link
        href={`/worlds/${worldId}/campaigns/${campaignId}/chats/${chat.id}`}
        className="flex-1 px-3 py-2 text-sm truncate"
        style={{ color: isActive ? "var(--primary)" : "var(--foreground)" }}
      >
        {chat.title ?? "Чат"}
      </Link>
      <div className="hidden group-hover:flex items-center pr-1 shrink-0 gap-0.5">
        <button
          onClick={() => setEditing(true)}
          title="Переименовать"
          className="p-1 rounded hover:bg-white/10 text-xs"
          style={{ color: "var(--muted)" }}
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          title="Удалить"
          className="p-1 rounded hover:bg-red-500/10 text-xs"
          style={{ color: "var(--muted)" }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default function Sidebar(props: Props) {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  return (
    <aside
      className="w-56 shrink-0 flex flex-col border-r h-full"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
        <Link href="/worlds" className="font-semibold tracking-tight text-sm hover:opacity-80 transition-opacity">
          ⚔️ DM Assistant
        </Link>
      </div>

      {props.mode === "root" && (
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          <NavItem href="/worlds" icon="🌍" label="Мои миры" active />
        </nav>
      )}

      {props.mode === "world" && (
        <>
          {/* Back */}
          <div className="px-3 py-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
            <Link
              href="/worlds"
              className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
              style={{ color: "var(--muted)" }}
            >
              ← Миры
            </Link>
            <p className="mt-1.5 font-medium text-sm truncate">{props.worldName}</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-3 space-y-0.5">
            <NavItem icon="📚" label="Канон мира" disabled />
          </nav>
        </>
      )}

      {props.mode === "campaign" && (
        <>
          {/* Back + campaign name */}
          <div className="px-3 py-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
            <Link
              href={`/worlds/${props.worldId}/campaigns`}
              className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
              style={{ color: "var(--muted)" }}
            >
              ← {props.worldName}
            </Link>
            <p className="mt-1.5 font-medium text-sm truncate">{props.campaignName}</p>
          </div>

          {/* Nav */}
          <nav className="px-2 py-3 space-y-0.5 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
            <NavItem
              href={`/worlds/${props.worldId}/campaigns/${props.campaignId}/canon`}
              icon="📚"
              label="Канон"
              active={pathname.endsWith("/canon")}
            />
            <NavItem icon="⚔️" label="Конфликты" disabled />
            <NavItem icon="💡" label="Идеи" disabled />
          </nav>

          {/* Chat list */}
          <div className="flex items-center justify-between px-3 py-2 shrink-0">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Чаты
            </span>
            <NewChatButton worldId={props.worldId} campaignId={props.campaignId} />
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
            {props.chats.length === 0 && (
              <p className="px-3 py-2 text-xs" style={{ color: "var(--muted)" }}>
                Нет чатов
              </p>
            )}
            {props.chats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                worldId={props.worldId}
                campaignId={props.campaignId}
                isActive={pathname.includes(chat.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* User / logout */}
      <div
        className="px-3 py-3 border-t shrink-0 space-y-2"
        style={{ borderColor: "var(--border)" }}
      >
        {email && (
          <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
            {email}
          </p>
        )}
        <LogoutButton />
      </div>
    </aside>
  );
}

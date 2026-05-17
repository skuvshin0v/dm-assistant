"use client";

import { useState } from "react";

type VisualStyle = "console" | "codex" | "ledger" | "atlas" | "obsidian";

type Theme = {
  id: string;
  name: string;
  note: string;
  style: VisualStyle;
  vars: Record<string, string>;
};

const themes: Theme[] = [
  {
    id: "ember",
    name: "Ember Console",
    note: "Плотный Cursor-like инструмент: контрастные rails, кодовая навигация, теплые action states.",
    style: "console",
    vars: {
      "--bg": "#0f1014",
      "--sidebar": "#15161c",
      "--panel": "#181920",
      "--panel-2": "#20212a",
      "--input": "#101116",
      "--border": "#30323c",
      "--border-strong": "#5a4735",
      "--text": "#eee8de",
      "--muted": "#938c83",
      "--faint": "#6f6860",
      "--primary": "#d89b45",
      "--primary-soft": "rgba(216,155,69,.14)",
      "--accent": "#e86f4d",
      "--accent-soft": "rgba(232,111,77,.13)",
      "--good": "#6fc79f",
      "--blue": "#88aee8",
      "--radius-shell": "12px",
      "--radius-card": "8px",
      "--radius-control": "6px",
      "--shadow": "0 24px 70px rgba(0,0,0,.34)",
    },
  },
  {
    id: "moss",
    name: "Moss Codex",
    note: "Мягче и спокойнее: как Claude/Codex для долгой подготовки, с природной палитрой кампании.",
    style: "codex",
    vars: {
      "--bg": "#0d1311",
      "--sidebar": "#131a17",
      "--panel": "#18211d",
      "--panel-2": "#202c26",
      "--input": "#101713",
      "--border": "#2e3f37",
      "--border-strong": "#456354",
      "--text": "#e4ebe4",
      "--muted": "#91a098",
      "--faint": "#6f7f76",
      "--primary": "#84d2a4",
      "--primary-soft": "rgba(132,210,164,.13)",
      "--accent": "#d8b56a",
      "--accent-soft": "rgba(216,181,106,.14)",
      "--good": "#70d99a",
      "--blue": "#86b8d9",
      "--radius-shell": "18px",
      "--radius-card": "14px",
      "--radius-control": "10px",
      "--shadow": "0 24px 72px rgba(0,0,0,.28)",
    },
  },
  {
    id: "ledger",
    name: "Clean Ledger",
    note: "Светлый цифровой стол мастера: больше Notion/Linear, но с канон-индексом и теплой типографикой.",
    style: "ledger",
    vars: {
      "--bg": "#eee5d5",
      "--sidebar": "#fbf6ed",
      "--panel": "#fffaf2",
      "--panel-2": "#f3eadb",
      "--input": "#fffdf8",
      "--border": "#d8c9b2",
      "--border-strong": "#b99b70",
      "--text": "#29231d",
      "--muted": "#74695c",
      "--faint": "#998c7b",
      "--primary": "#936322",
      "--primary-soft": "rgba(147,99,34,.11)",
      "--accent": "#b74f35",
      "--accent-soft": "rgba(183,79,53,.12)",
      "--good": "#3f8f68",
      "--blue": "#3d6f91",
      "--radius-shell": "14px",
      "--radius-card": "10px",
      "--radius-control": "8px",
      "--shadow": "0 24px 70px rgba(75,50,24,.16)",
    },
  },
  {
    id: "atlas",
    name: "Obsidian Atlas",
    note: "Свободный вариант с нуля: не чат в сайдбаре, а навигационная карта канона с командным ядром.",
    style: "atlas",
    vars: {
      "--bg": "#08090d",
      "--sidebar": "#0d1017",
      "--panel": "#0f121a",
      "--panel-2": "#171b27",
      "--input": "#0b0d13",
      "--border": "#252b3a",
      "--border-strong": "#6b5cff",
      "--text": "#edf0ff",
      "--muted": "#8990a6",
      "--faint": "#5e6578",
      "--primary": "#f4c95d",
      "--primary-soft": "rgba(244,201,93,.14)",
      "--accent": "#ff5d73",
      "--accent-soft": "rgba(255,93,115,.13)",
      "--good": "#42e6b5",
      "--blue": "#6aa8ff",
      "--radius-shell": "22px",
      "--radius-card": "16px",
      "--radius-control": "12px",
      "--shadow": "0 36px 90px rgba(0,0,0,.52), 0 0 0 1px rgba(107,92,255,.18)",
    },
  },
  {
    id: "obsidian",
    name: "Obsidian Vault",
    note: "Канон как vault заметок: backlinks, callouts, приглушенный графит и фиолетовая подсветка связей.",
    style: "obsidian",
    vars: {
      "--bg": "#19191f",
      "--sidebar": "#202027",
      "--panel": "#1f1f27",
      "--panel-2": "#292936",
      "--input": "#181820",
      "--border": "#343443",
      "--border-strong": "#8b6cff",
      "--text": "#e7e2f2",
      "--muted": "#a29aad",
      "--faint": "#756f80",
      "--primary": "#a78bfa",
      "--primary-soft": "rgba(167,139,250,.14)",
      "--accent": "#7c5cff",
      "--accent-soft": "rgba(124,92,255,.16)",
      "--good": "#66d9b8",
      "--blue": "#7db7ff",
      "--radius-shell": "12px",
      "--radius-card": "7px",
      "--radius-control": "7px",
      "--shadow": "0 28px 80px rgba(0,0,0,.38)",
    },
  },
];

const chats = ["После сессии 12", "Культ соленого маяка", "Политика барона"];

const proposals = [
  {
    kind: "npc",
    type: "Персонаж",
    action: "Новый",
    name: "Ирмелла Соль",
    body: "Контрабандистка, которая знает, какая из трех печатей поддельная.",
  },
  {
    kind: "loc",
    type: "Локация",
    action: "Обновить",
    name: "Глухая пристань",
    body: "Если партия отдаст печать культу, маяк погаснет до рассвета.",
  },
  {
    kind: "fct",
    type: "Фракция",
    action: "Связь",
    name: "Культ соленого маяка",
    body: "Связан с долгом барона и тайной бухгалтерией Ирмеллы.",
  },
];

const navItems = [
  { icon: "KB", label: "Канон", active: true },
  { icon: "CF", label: "Конфликты" },
  { icon: "ID", label: "Идеи" },
];

export default function StyleLabPage() {
  const [themeId, setThemeId] = useState(themes[0].id);
  const theme = themes.find((item) => item.id === themeId) ?? themes[0];

  return (
    <main className="min-h-screen bg-neutral-950 p-4">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[.03] p-3 text-white lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-base font-semibold">Chat visual lab</h1>
            <p className="text-sm text-white/55">Одна структура текущего чата, разные UI-характеры: не только палитра.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {themes.map((item) => (
              <button
                key={item.id}
                onClick={() => setThemeId(item.id)}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  item.id === themeId
                    ? "border-white/40 bg-white text-neutral-950"
                    : "border-white/10 bg-white/[.04] text-white/75 hover:bg-white/[.08]"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <section
          className={`h-[820px] overflow-hidden border ${theme.style === "console" ? "font-mono" : ""}`}
          style={{
            ...theme.vars,
            background:
              theme.style === "atlas"
                ? "radial-gradient(circle at 68% 12%, rgba(107,92,255,.18), transparent 28%), radial-gradient(circle at 16% 88%, rgba(66,230,181,.12), transparent 30%), var(--bg)"
                : theme.style === "obsidian"
                  ? "radial-gradient(circle at 70% 18%, rgba(124,92,255,.16), transparent 32%), linear-gradient(180deg, #202027, var(--bg))"
                : "var(--bg)",
            borderColor: "var(--border)",
            borderRadius: "var(--radius-shell)",
            color: "var(--text)",
            boxShadow: "var(--shadow)",
          }}
        >
          <div className="flex h-full overflow-hidden">
            <MockSidebar theme={theme} />
            <main className="flex-1 overflow-y-auto">
              <div className="flex h-full flex-col p-4">
                <MockChatWindow theme={theme} />
              </div>
            </main>
          </div>
        </section>
      </div>
    </main>
  );
}

function MockSidebar({ theme }: { theme: Theme }) {
  return (
    <aside
      className="hidden w-56 shrink-0 flex-col border-r lg:flex"
      style={{ background: "var(--sidebar)", borderColor: "var(--border)" }}
    >
      <div className="border-b px-4 py-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <BrandMark theme={theme} />
          <span className="text-sm font-semibold tracking-tight">DM Assistant</span>
        </div>
      </div>

      <div className="border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs" style={{ color: "var(--muted)" }}>← Северная Марка</p>
        <p className="mt-1.5 truncate text-sm font-medium">Соль и пепел</p>
      </div>

      <nav className="border-b px-2 py-3" style={{ borderColor: "var(--border)" }}>
        {navItems.map((item) => (
          <NavItem key={item.label} theme={theme} {...item} />
        ))}
      </nav>

      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>Чаты</span>
        <IconButton theme={theme} label="+" />
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2">
        {chats.map((chat, index) => (
          <ChatListItem key={chat} theme={theme} active={index === 0} label={chat} />
        ))}
      </div>

      <div className="border-t px-3 py-3" style={{ borderColor: "var(--border)" }}>
        <p className="truncate text-xs" style={{ color: "var(--muted)" }}>dm@example.com</p>
        <button className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Выйти</button>
      </div>
    </aside>
  );
}

function BrandMark({ theme }: { theme: Theme }) {
  if (theme.style === "obsidian") {
    return (
      <span
        className="grid h-8 w-8 place-items-center text-[11px] font-black"
        style={{
          background: "linear-gradient(135deg, #3d335f, #211f2b)",
          border: "1px solid var(--border-strong)",
          borderRadius: "8px",
          color: "var(--primary)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.08)",
        }}
      >
        OB
      </span>
    );
  }

  if (theme.style === "atlas") {
    return (
      <span
        className="grid h-9 w-9 place-items-center text-[10px] font-black"
        style={{
          background: "linear-gradient(135deg, rgba(107,92,255,.35), rgba(244,201,93,.18))",
          border: "1px solid var(--border-strong)",
          clipPath: "polygon(50% 0, 94% 25%, 94% 75%, 50% 100%, 6% 75%, 6% 25%)",
          color: "var(--primary)",
        }}
      >
        DM
      </span>
    );
  }

  if (theme.style === "console") {
    return (
      <span
        className="grid h-7 w-7 place-items-center border text-[10px] font-bold"
        style={{ background: "var(--primary-soft)", borderColor: "var(--primary)", borderRadius: "var(--radius-control)", color: "var(--primary)" }}
      >
        D20
      </span>
    );
  }

  if (theme.style === "ledger") {
    return (
      <span
        className="grid h-8 w-8 place-items-center border text-xs font-serif font-black"
        style={{ background: "var(--panel-2)", borderColor: "var(--border-strong)", borderRadius: "50%", color: "var(--primary)" }}
      >
        20
      </span>
    );
  }

  return (
    <span
      className="grid h-8 w-8 place-items-center text-xs font-bold"
      style={{ background: "linear-gradient(135deg, var(--primary-soft), var(--accent-soft))", border: "1px solid var(--border-strong)", borderRadius: "10px", color: "var(--primary)" }}
    >
      DM
    </span>
  );
}

function IconButton({ theme, label }: { theme: Theme; label: string }) {
  return (
    <button
      className="grid h-6 w-6 place-items-center text-sm"
      style={{
        background: theme.style === "ledger" ? "var(--panel-2)" : "var(--primary-soft)",
        border: theme.style === "console" || theme.style === "atlas" || theme.style === "obsidian" ? "1px solid var(--border-strong)" : "1px solid transparent",
        borderRadius: theme.style === "ledger" ? "50%" : "var(--radius-control)",
        color: "var(--primary)",
      }}
    >
      {label}
    </button>
  );
}

function NavItem({
  theme,
  icon,
  label,
  active,
}: {
  theme: Theme;
  icon: string;
  label: string;
  active?: boolean;
}) {
  const baseStyle = {
    color: active ? "var(--primary)" : "var(--text)",
    borderRadius: "var(--radius-control)",
  };

  if (theme.style === "console") {
    return (
      <div
        className="mb-1 flex items-center gap-2.5 border-l-2 px-3 py-2 text-sm"
        style={{
          ...baseStyle,
          background: active ? "var(--primary-soft)" : "transparent",
          borderColor: active ? "var(--primary)" : "transparent",
        }}
      >
        <MonoIcon label={icon} active={active} />
        <span>{label}</span>
      </div>
    );
  }

  if (theme.style === "ledger") {
    return (
      <div
        className="mb-1 flex items-center justify-between px-3 py-2 text-sm"
        style={{
          ...baseStyle,
          background: active ? "var(--primary-soft)" : "transparent",
          boxShadow: active ? "inset 0 -1px 0 var(--border-strong)" : "none",
        }}
      >
        <span className="flex items-center gap-2.5">
          <MonoIcon label={icon} active={active} />
          <span>{label}</span>
        </span>
        {active && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--primary)" }} />}
      </div>
    );
  }

  if (theme.style === "atlas") {
    return (
      <div
        className="mb-1 flex items-center justify-between border px-3 py-2 text-sm"
        style={{
          ...baseStyle,
          background: active ? "linear-gradient(90deg, var(--primary-soft), rgba(107,92,255,.12))" : "transparent",
          borderColor: active ? "var(--border-strong)" : "transparent",
          boxShadow: active ? "0 0 24px rgba(107,92,255,.12)" : "none",
        }}
      >
        <span className="flex items-center gap-2.5">
          <MonoIcon label={icon} active={active} />
          <span>{label}</span>
        </span>
        {active && <span className="text-[10px]" style={{ color: "var(--primary)" }}>LIVE</span>}
      </div>
    );
  }

  if (theme.style === "obsidian") {
    return (
      <div
        className="mb-1 flex items-center gap-2.5 border-l-2 px-3 py-2 text-sm"
        style={{
          ...baseStyle,
          background: active ? "var(--accent-soft)" : "transparent",
          borderColor: active ? "var(--primary)" : "transparent",
        }}
      >
        <MonoIcon label={icon} active={active} />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div
      className="mb-1 flex items-center gap-2.5 px-3 py-2 text-sm"
      style={{ ...baseStyle, background: active ? "var(--primary-soft)" : "transparent" }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: active ? "var(--primary)" : "var(--faint)" }} />
      <MonoIcon label={icon} active={active} />
      <span>{label}</span>
    </div>
  );
}

function MonoIcon({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className="grid h-5 w-5 shrink-0 place-items-center text-[9px] font-bold"
      style={{
        background: active ? "var(--primary-soft)" : "var(--panel-2)",
        border: "1px solid var(--border)",
        borderRadius: "5px",
        color: active ? "var(--primary)" : "var(--muted)",
      }}
    >
      {label}
    </span>
  );
}

function ChatListItem({ theme, active, label }: { theme: Theme; active: boolean; label: string }) {
  const marker = theme.style === "console" ? "#" : theme.style === "ledger" ? "•" : theme.style === "atlas" ? "◇" : theme.style === "obsidian" ? "[[" : "○";

  return (
    <div
      className="flex items-center gap-2 truncate px-3 py-2 text-sm"
      style={{
        background: active ? "var(--primary-soft)" : "transparent",
        border: active && (theme.style === "ledger" || theme.style === "atlas" || theme.style === "obsidian") ? "1px solid var(--border-strong)" : "1px solid transparent",
        borderRadius: "var(--radius-control)",
        color: active ? "var(--primary)" : "var(--text)",
      }}
    >
      <span style={{ color: active ? "var(--primary)" : "var(--faint)" }}>{marker}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function MockChatWindow({ theme }: { theme: Theme }) {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden border"
      style={{
        borderColor: "var(--border)",
        background:
          theme.style === "atlas"
            ? "linear-gradient(180deg, rgba(23,27,39,.82), rgba(15,18,26,.96))"
            : theme.style === "obsidian"
              ? "linear-gradient(180deg, rgba(41,41,54,.86), rgba(31,31,39,.98))"
            : "var(--panel)",
        borderRadius: "var(--radius-card)",
      }}
    >
      <div
        className={`border-b px-5 py-3 ${theme.style === "console" || theme.style === "atlas" ? "uppercase tracking-wide" : ""}`}
        style={{
          borderColor: "var(--border)",
          background:
            theme.style === "atlas"
              ? "linear-gradient(90deg, rgba(107,92,255,.12), rgba(244,201,93,.04), transparent)"
              : theme.style === "obsidian"
                ? "linear-gradient(90deg, rgba(124,92,255,.16), rgba(41,41,54,.7))"
              : "var(--panel)",
        }}
      >
        <p className="text-xs" style={{ color: "var(--muted)" }}>{theme.name}</p>
        <h2 className="text-sm font-semibold normal-case tracking-normal">{theme.note}</h2>
      </div>

      <div
        className={`flex-1 overflow-y-auto ${theme.style === "console" ? "space-y-3 p-5" : "space-y-4 p-6"}`}
        style={{
          background:
            theme.style === "ledger"
              ? "linear-gradient(180deg, var(--panel), var(--bg))"
              : theme.style === "atlas"
                ? "radial-gradient(circle at 82% 14%, rgba(107,92,255,.16), transparent 26%), linear-gradient(180deg, transparent, rgba(0,0,0,.18)), var(--panel)"
                : theme.style === "obsidian"
                  ? "linear-gradient(90deg, rgba(167,139,250,.035) 0 1px, transparent 1px 28px), var(--panel)"
              : "var(--panel)",
        }}
      >
        <UserMessage theme={theme} />
        <ThinkingMessage theme={theme} />

        <div className="space-y-3">
          <SectionLabel theme={theme} label="Нашел изменения для мира" />
          {proposals.map((proposal, index) => (
            <ProposalCard key={proposal.name} theme={theme} proposal={proposal} index={index} />
          ))}

          <div className="flex gap-3 pt-1">
            <PrimaryButton theme={theme}>Сохранить принятые (3)</PrimaryButton>
            <button
              className="border px-4 py-2 text-sm"
              style={{ borderColor: "var(--border)", borderRadius: "var(--radius-control)", color: "var(--muted)" }}
            >
              Отменить
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-t px-4 pb-1 pt-3" style={{ borderColor: "var(--border)" }}>
        <ModeButton theme={theme} icon="WR" label="Записать" active />
        <ModeButton theme={theme} icon="SR" label="Найти" />
        <ModeButton theme={theme} icon="ID" label="Идеи" />
      </div>

      <form className="flex items-end gap-3 p-4">
        <textarea
          rows={1}
          defaultValue="Добавь это в канон и предложи, чем это может аукнуться в следующей сессии"
          className="max-h-32 flex-1 resize-none border px-4 py-2.5 text-sm outline-none"
          style={{
            background: "var(--input)",
            borderColor: "var(--border)",
            borderRadius: "var(--radius-control)",
            color: "var(--text)",
            lineHeight: "1.5rem",
            boxShadow:
              theme.style === "atlas"
                ? "0 0 0 1px rgba(107,92,255,.14), inset 0 1px 0 rgba(255,255,255,.04)"
                : theme.style === "obsidian"
                  ? "0 0 0 1px rgba(167,139,250,.14), inset 0 1px 0 rgba(255,255,255,.05)"
                : theme.style === "codex"
                  ? "inset 0 1px 0 rgba(255,255,255,.04)"
                  : "none",
          }}
        />
        <PrimaryButton theme={theme}>Отправить</PrimaryButton>
      </form>
    </div>
  );
}

function UserMessage({ theme }: { theme: Theme }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[76%] px-4 py-2.5 text-sm leading-6"
        style={{
          background:
            theme.style === "atlas"
              ? "linear-gradient(135deg, var(--accent), var(--border-strong))"
              : theme.style === "obsidian"
                ? "linear-gradient(135deg, #6d55e8, #8b6cff)"
              : theme.style === "codex"
              ? "linear-gradient(135deg, var(--accent), var(--primary))"
              : "var(--accent)",
          borderRadius:
            theme.style === "console"
              ? "var(--radius-control) var(--radius-control) 2px var(--radius-control)"
              : theme.style === "atlas"
                ? "22px 22px 2px 22px"
                : theme.style === "obsidian"
                  ? "var(--radius-card) var(--radius-card) 2px var(--radius-card)"
              : "18px 18px 4px 18px",
          color: "#fff",
          boxShadow: theme.style === "ledger" ? "0 8px 20px rgba(80,50,20,.12)" : "none",
        }}
      >
        На сессии Ирмелла намекнула, что долг барона связан с тремя печатями. Одна из них поддельная.
      </div>
    </div>
  );
}

function ThinkingMessage({ theme }: { theme: Theme }) {
  return (
    <div className="flex justify-start">
      <div
        className="flex items-center gap-2 border px-4 py-2.5 text-sm"
        style={{
          background: "var(--input)",
          borderColor: "var(--border)",
          borderRadius: theme.style === "console" || theme.style === "atlas" || theme.style === "obsidian" ? "var(--radius-control)" : "999px",
          color: "var(--muted)",
        }}
      >
        <span className="flex gap-1">
          {[0, 1, 2].map((item) => (
            <span key={item} className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--primary)", opacity: 1 - item * 0.25 }} />
          ))}
        </span>
        <span>Анализирую заметки... сверяю с каноном кампании...</span>
      </div>
    </div>
  );
}

function SectionLabel({ theme, label }: { theme: Theme; label: string }) {
  if (theme.style === "ledger") {
    return (
      <div className="flex items-center gap-3">
        <span className="h-px flex-1" style={{ background: "var(--border)" }} />
        <p className="text-xs font-semibold uppercase tracking-[.18em]" style={{ color: "var(--muted)" }}>{label}</p>
        <span className="h-px flex-1" style={{ background: "var(--border)" }} />
      </div>
    );
  }

  if (theme.style === "atlas") {
    return (
      <div className="flex items-center gap-3">
        <p className="text-xs font-black uppercase tracking-[.22em]" style={{ color: "var(--primary)" }}>
          {label}
        </p>
        <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, var(--border-strong), transparent)" }} />
      </div>
    );
  }

  if (theme.style === "obsidian") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "var(--primary)" }}>#</span>
        <p className="text-xs font-semibold uppercase tracking-[.14em]" style={{ color: "var(--muted)" }}>
          {label}
        </p>
      </div>
    );
  }

  return (
    <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
      {theme.style === "console" ? "> " : ""}{label}
    </p>
  );
}

function ProposalCard({
  theme,
  proposal,
  index,
}: {
  theme: Theme;
  proposal: { kind: string; type: string; action: string; name: string; body: string };
  index: number;
}) {
  const colors = ["var(--accent)", "var(--good)", "var(--blue)"];
  const color = colors[index % colors.length];

  if (theme.style === "console") {
    return (
      <div className="grid grid-cols-[4px_34px_minmax(0,1fr)_auto] gap-3 border p-3" style={{ background: "var(--input)", borderColor: "var(--border)", borderRadius: "var(--radius-card)" }}>
        <span className="h-full rounded-full" style={{ background: color }} />
        <EntityIcon theme={theme} label={proposal.kind} color={color} />
        <ProposalBody proposal={proposal} color={color} />
        <AcceptButton color={color} compact />
      </div>
    );
  }

  if (theme.style === "ledger") {
    return (
      <div className="border p-4" style={{ background: "var(--input)", borderColor: "var(--border)", borderRadius: "var(--radius-card)" }}>
        <div className="mb-3 flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <EntityIcon theme={theme} label={proposal.kind} color={color} />
            <ProposalTitle proposal={proposal} color={color} />
          </div>
          <AcceptButton color={color} />
        </div>
        <p className="pl-11 text-sm leading-6" style={{ color: "var(--text)" }}>{proposal.body}</p>
      </div>
    );
  }

  if (theme.style === "atlas") {
    return (
      <div
        className="grid grid-cols-[42px_minmax(0,1fr)_auto] gap-3 border p-3"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,.035), rgba(107,92,255,.055))",
          borderColor: "var(--border)",
          borderRadius: "var(--radius-card)",
          boxShadow: `inset 0 0 0 1px rgba(255,255,255,.025), 0 0 0 1px color-mix(in srgb, ${color}, transparent 82%)`,
        }}
      >
        <EntityIcon theme={theme} label={proposal.kind} color={color} />
        <ProposalBody proposal={proposal} color={color} />
        <AcceptButton color={color} compact />
      </div>
    );
  }

  return (
    <div className="flex gap-3 border p-4" style={{ background: "var(--input)", borderColor: "var(--border)", borderRadius: "var(--radius-card)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.04)" }}>
      <EntityIcon theme={theme} label={proposal.kind} color={color} />
      <div className="min-w-0 flex-1">
        <ProposalTitle proposal={proposal} color={color} />
        <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--text)" }}>{proposal.body}</p>
      </div>
      <AcceptButton color={color} />
    </div>
  );
}

function EntityIcon({ theme, label, color }: { theme: Theme; label: string; color: string }) {
  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center text-[10px] font-black uppercase"
      style={{
        background: theme.style === "ledger" ? "var(--panel-2)" : "color-mix(in srgb, var(--panel-2), transparent 8%)",
        border: `1px solid ${color}`,
        borderRadius: theme.style === "codex" ? "50%" : "var(--radius-control)",
        clipPath: theme.style === "atlas" ? "polygon(50% 0, 100% 28%, 100% 72%, 50% 100%, 0 72%, 0 28%)" : "none",
        color,
      }}
    >
      {label}
    </span>
  );
}

function ProposalBody({
  proposal,
  color,
}: {
  proposal: { type: string; action: string; name: string; body: string };
  color: string;
}) {
  return (
    <div className="min-w-0">
      <ProposalTitle proposal={proposal} color={color} />
      <p className="mt-1.5 text-sm leading-6" style={{ color: "var(--text)" }}>{proposal.body}</p>
    </div>
  );
}

function ProposalTitle({
  proposal,
  color,
}: {
  proposal: { type: string; action: string; name: string };
  color: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold">{proposal.name}</span>
      <span className="rounded px-1.5 py-0.5 text-xs" style={{ background: "var(--primary-soft)", color }}>
        {proposal.action}
      </span>
      <span className="text-xs" style={{ color: "var(--muted)" }}>{proposal.type}</span>
    </div>
  );
}

function AcceptButton({ color, compact }: { color: string; compact?: boolean }) {
  return (
    <button
      className="shrink-0 self-start border px-3 py-1.5 text-xs"
      style={{ borderColor: color, borderRadius: "var(--radius-control)", color }}
    >
      {compact ? "OK" : "Принят"}
    </button>
  );
}

function PrimaryButton({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  return (
    <button
      className="shrink-0 px-4 py-2 text-sm font-medium"
      style={{
        background:
          theme.style === "atlas"
            ? "linear-gradient(135deg, var(--primary), var(--good))"
            : theme.style === "codex"
            ? "linear-gradient(135deg, var(--primary), var(--accent))"
            : "var(--primary)",
        borderRadius: "var(--radius-control)",
        color: theme.style === "ledger" ? "#fffaf0" : "#16120d",
        boxShadow:
          theme.style === "atlas"
            ? "0 0 28px rgba(244,201,93,.18)"
            : theme.style === "console"
              ? "none"
              : "0 8px 20px rgba(0,0,0,.14)",
      }}
    >
      {children}
    </button>
  );
}

function ModeButton({ theme, icon, label, active }: { theme: Theme; icon: string; label: string; active?: boolean }) {
  return (
    <button
      className="flex items-center gap-2 border px-3 py-1.5 text-xs"
      style={{
        borderColor: active ? "var(--primary)" : "var(--border)",
        borderRadius: theme.style === "codex" ? "999px" : "var(--radius-control)",
        color: active ? "var(--primary)" : "var(--muted)",
        background:
          active && theme.style === "atlas"
            ? "linear-gradient(90deg, var(--primary-soft), rgba(107,92,255,.12))"
            : active
              ? "var(--primary-soft)"
              : "transparent",
      }}
    >
      <MonoIcon label={icon} active={active} />
      <span>{label}</span>
    </button>
  );
}

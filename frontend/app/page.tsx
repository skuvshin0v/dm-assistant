import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import Icon from "@/components/Icon";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lastChat = user ? (cookieStore.get("last_chat_url")?.value ?? "/worlds") : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <header className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Icon name="sword" className="h-5 w-5" />
          DM Assistant
        </span>
        <div className="flex gap-4 text-sm">
          {user ? (
            <Link
              href={lastChat!}
              className="px-4 py-2 rounded-md text-white font-medium transition-colors"
              style={{ background: "var(--primary)" }}
            >
              Открыть приложение
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 rounded-md transition-colors" style={{ color: "var(--muted)" }}>
                Войти
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-md text-white font-medium transition-colors"
                style={{ background: "var(--primary)" }}
              >
                Начать бесплатно
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm font-medium tracking-widest uppercase" style={{ color: "var(--primary)" }}>
            Для Мастеров Подземелий
          </p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Единое место для мира<br />кампании + AI, который<br />знает этот мир
          </h1>
          <p className="text-xl" style={{ color: "var(--muted)" }}>
            Записываешь один раз — AI помнит всегда. Находит нужное, генерирует идеи в логике твоей кампании.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link
              href="/register"
              className="px-8 py-3 rounded-lg text-white font-semibold text-lg transition-colors"
              style={{ background: "var(--primary)" }}
            >
              Начать бесплатно
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl w-full text-left">
          {[
            {
              iconName: "edit" as const,
              title: "Само запоминает",
              desc: "Вставил заметки → AI разобрал NPC и локации → подтвердил → мир наполнен.",
            },
            {
              iconName: "search" as const,
              title: "Знает твой мир",
              desc: 'Написал "кто такой Варрен?" → AI ответил точно, с деталями из твоих записей.',
            },
            {
              iconName: "lightbulb" as const,
              title: "Идеи в стиле мира",
              desc: "Попросил придумать квест → получил идеи с именами из твоей кампании.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl p-6 space-y-3 border"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <Icon name={f.iconName} className="h-8 w-8" />
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

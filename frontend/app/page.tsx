import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <header className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="text-lg font-semibold tracking-tight">⚔️ DM Assistant</span>
        <div className="flex gap-4 text-sm">
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
              icon: "📝",
              title: "Само запоминает",
              desc: "Вставил заметки → AI разобрал NPC и локации → подтвердил → мир наполнен.",
            },
            {
              icon: "🔍",
              title: "Знает твой мир",
              desc: 'Написал "кто такой Варрен?" → AI ответил точно, с деталями из твоих записей.',
            },
            {
              icon: "💡",
              title: "Идеи в стиле мира",
              desc: "Попросил придумать квест → получил идеи с именами из твоей кампании.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl p-6 space-y-3 border"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <span className="text-3xl">{f.icon}</span>
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

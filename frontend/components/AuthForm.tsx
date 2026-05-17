"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = { mode: "login" | "register" };

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/worlds");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/worlds");
        router.refresh();
      }
    }

    setLoading(false);
  }

  const isLogin = mode === "login";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8 space-y-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="space-y-1">
          <Link href="/" className="text-sm" style={{ color: "var(--muted)" }}>
            ← DM Assistant
          </Link>
          <h1 className="text-2xl font-bold mt-2">
            {isLogin ? "Войти" : "Создать аккаунт"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none border focus:border-[var(--primary)] transition-colors"
              style={{
                background: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
              placeholder="dungeon@master.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Пароль
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none border focus:border-[var(--primary)] transition-colors"
              style={{
                background: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 rounded-lg px-3 py-2 bg-red-400/10">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2.5 font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: "var(--primary)" }}
          >
            {loading ? "..." : isLogin ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>

        <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
          {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
          <Link
            href={isLogin ? "/register" : "/login"}
            className="font-medium"
            style={{ color: "var(--primary)" }}
          >
            {isLogin ? "Зарегистрироваться" : "Войти"}
          </Link>
        </p>
      </div>
    </div>
  );
}

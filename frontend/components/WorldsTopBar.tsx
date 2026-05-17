"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "./LogoutButton";

export default function WorldsTopBar() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b shrink-0"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <Link href="/" className="font-semibold tracking-tight hover:opacity-80 transition-opacity">
        ⚔️ DM Assistant
      </Link>
      <div className="flex items-center gap-3">
        {email && <span className="text-xs" style={{ color: "var(--muted)" }}>{email}</span>}
        <LogoutButton />
      </div>
    </header>
  );
}

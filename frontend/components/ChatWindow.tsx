"use client";

import { useState } from "react";

export default function ChatWindow() {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // AI-режимы появятся в следующей версии
    alert("AI-режимы появятся в следующей версии");
    setInput("");
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-3xl">🎲</p>
          <p className="font-medium">Чат готов</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            AI-режимы появятся в следующей версии.
            <br />
            Записать / Найти / Идеи
          </p>
        </div>
      </div>

      {/* Mode buttons */}
      <div
        className="flex gap-2 px-4 pt-3 pb-1 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        {["📝 Записать", "🔍 Найти", "💡 Идеи"].map((mode) => (
          <button
            key={mode}
            disabled
            className="px-3 py-1.5 rounded-md text-xs border opacity-40 cursor-not-allowed"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3 p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Напиши заметку о прошедшей сессии..."
          className="flex-1 rounded-lg px-4 py-2.5 text-sm border outline-none focus:border-[var(--primary)] transition-colors"
          style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-lg text-white text-sm font-medium shrink-0"
          style={{ background: "var(--primary)" }}
        >
          Отправить
        </button>
      </form>
    </div>
  );
}

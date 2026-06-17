"use client";

import { useState, type ReactNode } from "react";

export default function EventsViewTabs({
  leagueView,
  groupsView,
}: {
  leagueView: ReactNode;
  groupsView: ReactNode;
}) {
  const [tab, setTab] = useState<"leagues" | "groups">("leagues");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-1 w-fit">
        {[
          { id: "leagues" as const, label: "Ligi" },
          { id: "groups" as const, label: "🏆 Grupy MŚ 2026" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
              tab === t.id ? "bg-sky-400/15 text-sky-200" : "text-white/55 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "leagues" ? leagueView : groupsView}
    </div>
  );
}

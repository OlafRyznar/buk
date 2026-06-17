"use client";

export default function ProfitChart({ data }: { data: { month: string; profit: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-white/40">Brak danych do wykresu — dodaj pierwszy zakład.</p>;
  }

  const maxAbs = Math.max(1, ...data.map((d) => Math.abs(d.profit)));

  return (
    <div className="flex items-end gap-2 overflow-x-auto pb-1" style={{ height: 140 }}>
      {data.map((d) => {
        const heightPct = (Math.abs(d.profit) / maxAbs) * 100;
        const positive = d.profit >= 0;
        return (
          <div key={d.month} className="flex h-full min-w-[44px] flex-1 flex-col items-center justify-end gap-1.5">
            <span
              className={`font-mono text-[10px] tabular-nums ${positive ? "text-emerald-300" : "text-rose-300"}`}
            >
              {positive ? "+" : ""}
              {d.profit.toFixed(0)}
            </span>
            <div className="flex h-full w-full items-end">
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${
                  positive ? "bg-gradient-to-t from-emerald-500/20 to-emerald-400" : "bg-gradient-to-t from-rose-500/20 to-rose-400"
                }`}
                style={{ height: `${Math.max(heightPct, 3)}%` }}
              />
            </div>
            <span className="max-w-[60px] truncate text-center text-[10px] capitalize text-white/35">
              {d.month}
            </span>
          </div>
        );
      })}
    </div>
  );
}

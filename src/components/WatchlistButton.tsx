"use client";

import { useApp } from "@/components/AppProvider";

interface WatchlistButtonProps {
  eventId: string;
  className?: string;
}

export default function WatchlistButton({ eventId, className = "" }: WatchlistButtonProps) {
  const { watchlist, toggleWatchlist } = useApp();
  const isWatched = watchlist.includes(eventId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWatchlist(eventId);
      }}
      aria-pressed={isWatched}
      title={isWatched ? "Usuń z watchlisty" : "Dodaj do watchlisty"}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border p-1.5 transition ${
        isWatched
          ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
          : "border-white/12 bg-white/[0.03] text-white/40 hover:text-white/70"
      } ${className}`}
    >
      <svg
        className="h-4 w-4"
        fill={isWatched ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 21.04a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    </button>
  );
}

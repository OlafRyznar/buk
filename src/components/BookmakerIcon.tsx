"use client";

import { useState } from "react";
import { getBookmakerIconUrl } from "@/lib/store-types";
import { BOOKMAKER_LOGOS } from "@/lib/types";

interface BookmakerIconProps {
  bookmakerKey: string;
  size?: number;
  className?: string;
}

/** Real bookmaker favicon, falling back to the colored-dot emoji if the
 * favicon proxy has nothing for that domain (unknown bookmaker, network
 * hiccup, etc.) — never a broken image icon. */
export default function BookmakerIcon({ bookmakerKey, size = 16, className = "" }: BookmakerIconProps) {
  const url = getBookmakerIconUrl(bookmakerKey, size);
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    const normalized = bookmakerKey?.toLowerCase().replace(/\s+/g, "") ?? "";
    return (
      <span className={`inline-block leading-none ${className}`} style={{ fontSize: size * 0.75 }} aria-hidden>
        {BOOKMAKER_LOGOS[normalized] ?? "⚪"}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`inline-block shrink-0 rounded-[4px] align-[-3px] ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

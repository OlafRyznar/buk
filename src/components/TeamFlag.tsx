import { getFlagCode, getFlagUrl } from "@/lib/flags";

interface TeamFlagProps {
  team: string;
  /** Rendered width in px (real flag bitmaps, not emoji). */
  size?: number;
  className?: string;
}

/**
 * Real country-flag image for national teams (flagcdn.com bitmaps).
 * Renders nothing for club teams, so it can be used anywhere a team
 * name appears.
 */
export default function TeamFlag({ team, size = 20, className = "" }: TeamFlagProps) {
  const code = getFlagCode(team);
  if (!code) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getFlagUrl(code, 40)}
      srcSet={`${getFlagUrl(code, 80)} 2x`}
      alt={`Flaga: ${team}`}
      width={size}
      style={{ width: size, height: "auto" }}
      loading="lazy"
      className={`inline-block shrink-0 rounded-[3px] align-[-2px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] ring-1 ring-white/15 ${className}`}
    />
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: "emerald" | "blue" | "amber" | "red";
}

const colorMap = {
  emerald: {
    text: "text-emerald-300",
    icon: "text-emerald-300",
  },
  blue: {
    text: "text-sky-300",
    icon: "text-sky-300",
  },
  amber: {
    text: "text-amber-300",
    icon: "text-amber-300",
  },
  red: {
    text: "text-rose-300",
    icon: "text-rose-300",
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "emerald",
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className="glass-panel card-hover rounded-xl p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-wide text-white/50">{title}</p>
          <p className={`mt-1.5 text-2xl font-bold font-mono tracking-tight ${colors.text}`}>{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-white/40">{subtitle}</p>
          )}
        </div>
        <div className={`p-1.5 ${colors.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

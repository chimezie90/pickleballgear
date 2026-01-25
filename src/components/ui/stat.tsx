import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

interface StatProps {
  label: string;
  value: number | string;
  suffix?: string;
  highlight?: boolean;
  className?: string;
}

export function Stat({
  label,
  value,
  suffix,
  highlight = false,
  className,
}: StatProps) {
  const formattedValue =
    typeof value === "number" ? formatNumber(value) : value;

  return (
    <div className={cn("text-center", className)}>
      <div
        className={cn(
          "text-2xl font-bold tabular-nums",
          highlight ? "text-primary" : "text-foreground"
        )}
      >
        {formattedValue}
        {suffix && <span className="text-lg text-muted ml-0.5">{suffix}</span>}
      </div>
      <div className="text-xs text-muted uppercase tracking-wide mt-1">
        {label}
      </div>
    </div>
  );
}

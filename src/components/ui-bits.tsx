import { avatarEmoji } from "@/lib/defaults";

export function AvatarBubble({
  avatar,
  name,
  size = "md",
}: {
  avatar: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg" ? "h-16 w-16 text-3xl" : size === "sm" ? "h-10 w-10 text-lg" : "h-12 w-12 text-2xl";

  return (
    <div
      className={`grid ${dim} shrink-0 place-items-center rounded-2xl bg-brand-soft`}
      aria-label={name}
      title={name}
    >
      <span aria-hidden>{avatarEmoji(avatar)}</span>
    </div>
  );
}

export function PointsPill({ points }: { points: number }) {
  return (
    <span className="cm-points rounded-full bg-accent-soft px-3 py-1 text-sm">
      +{points}
    </span>
  );
}

export function ProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label?: string;
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between gap-3 text-sm text-ink-soft">
          <span>{label}</span>
          <span className="font-semibold text-foreground">{pct}%</span>
        </div>
      ) : null}
      <div className="cm-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

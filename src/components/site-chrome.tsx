import Link from "next/link";

export function SiteHeader({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <header className="cm-shell flex flex-wrap items-center justify-between gap-3 py-5">
      <Link href="/" className="flex min-w-0 items-center gap-2">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand text-lg font-bold text-white shadow-[0_10px_24px_rgba(15,118,110,0.28)]">
          CM
        </span>
        <span
          className="truncate text-xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          ChoreMate
        </span>
      </Link>
      {!compact && (
        <nav className="flex flex-wrap items-center justify-end gap-2">
          <Link href="/kid" className="cm-btn cm-btn-ghost px-3 text-sm sm:px-4">
            Kid login
          </Link>
          <Link href="/login" className="cm-btn cm-btn-secondary px-3 text-sm sm:px-4">
            Parent login
          </Link>
          <Link href="/signup" className="cm-btn cm-btn-primary px-3 text-sm sm:px-4">
            Get started
          </Link>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="cm-shell mt-auto border-t border-[var(--line)] py-8 text-sm text-ink-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>ChoreMate — make helping at home a game.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/kid">Kid login</Link>
          <Link href="/login">Parent login</Link>
        </div>
      </div>
    </footer>
  );
}

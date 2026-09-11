"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="cm-shell flex min-h-[60vh] flex-col items-start justify-center gap-4 py-16">
      <p className="cm-chip">Error</p>
      <h1
        className="text-3xl font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-sora), sans-serif" }}
      >
        We hit a snag
      </h1>
      <p className="max-w-md text-ink-soft">
        Try again in a moment. If this keeps happening, check your connection and
        environment setup.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="cm-btn cm-btn-primary" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="cm-btn cm-btn-secondary">
          Home
        </Link>
      </div>
    </div>
  );
}

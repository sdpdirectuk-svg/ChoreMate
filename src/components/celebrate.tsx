"use client";

type CelebrateProps = {
  message: string;
  show: boolean;
};

/** Subtle toast. Parent toggles `show` when an action succeeds. */
export function Celebrate({ message, show }: CelebrateProps) {
  if (!show) return null;

  return (
    <div
      role="status"
      className="cm-pop fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white shadow-lg"
    >
      {message}
    </div>
  );
}

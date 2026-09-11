import Link from "next/link";
import { signOutParent } from "@/lib/actions/auth-setup";

const links = [
  { href: "/app", label: "Home" },
  { href: "/app/chores", label: "Chores" },
  { href: "/app/rewards", label: "Rewards" },
  { href: "/app/family", label: "Family" },
  { href: "/app/settings", label: "Settings" },
];

export function ParentNav({
  familyName,
  kidCode,
}: {
  familyName: string;
  kidCode: string;
}) {
  return (
    <header className="border-b border-[var(--line)] bg-white/70 backdrop-blur">
      <div className="cm-shell flex flex-col gap-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Link
              href="/app"
              className="text-xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-sora), sans-serif" }}
            >
              ChoreMate
            </Link>
            <p className="text-sm text-ink-soft">{familyName}</p>
          </div>
          <form action={signOutParent}>
            <button className="cm-btn cm-btn-ghost text-sm" type="submit">
              Sign out
            </button>
          </form>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="cm-btn cm-btn-secondary px-3 text-sm">
              {link.label}
            </Link>
          ))}
          <span className="cm-chip ml-auto">Kid code: {kidCode}</span>
        </div>
      </div>
    </header>
  );
}

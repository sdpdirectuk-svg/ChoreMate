import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader compact />
      <main className="cm-shell flex flex-1 flex-col items-start justify-center gap-4 py-16">
        <p className="cm-chip">404</p>
        <h1
          className="text-4xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          That page wandered off
        </h1>
        <p className="max-w-md text-ink-soft">
          The link might be old, or the page might be private to a family account.
        </p>
        <Link href="/" className="cm-btn cm-btn-primary">
          Back to homepage
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

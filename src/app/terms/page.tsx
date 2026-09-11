import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata = {
  title: "Terms",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader compact />
      <main className="cm-shell max-w-3xl space-y-5 py-10">
        <h1
          className="text-4xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          Terms
        </h1>
        <p className="text-ink-soft">Last updated: 9 September 2026</p>
        <p>
          ChoreMate is a family chore and rewards tool. By using the service you agree to
          use it responsibly for your own household.
        </p>
        <h2 className="text-2xl font-semibold">Accounts</h2>
        <p className="text-ink-soft">
          Parents are responsible for their household settings, child profiles, and access
          codes. Keep your login details and kid access code private.
        </p>
        <h2 className="text-2xl font-semibold">Acceptable use</h2>
        <p className="text-ink-soft">
          Do not attempt to access another family&apos;s data, disrupt the service, or use
          ChoreMate for unlawful purposes.
        </p>
        <h2 className="text-2xl font-semibold">Service availability</h2>
        <p className="text-ink-soft">
          V1 is provided as-is. Features may change. Rewards inside the app are household
          agreements — ChoreMate does not process payments or real money for children.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

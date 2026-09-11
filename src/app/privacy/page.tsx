import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader compact />
      <main className="cm-shell prose-like max-w-3xl space-y-5 py-10">
        <h1
          className="text-4xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          Privacy
        </h1>
        <p className="text-ink-soft">Last updated: 9 September 2026</p>
        <p>
          ChoreMate stores family account data so parents can manage chores, points,
          and rewards. We do not sell personal data.
        </p>
        <h2 className="text-2xl font-semibold">What we store</h2>
        <ul className="list-disc space-y-2 pl-5 text-ink-soft">
          <li>Parent account email and authentication details (via Supabase Auth)</li>
          <li>Household settings, chores, rewards, and points history</li>
          <li>Child profile names, optional avatars/PINs, and activity inside the household</li>
        </ul>
        <h2 className="text-2xl font-semibold">Child access</h2>
        <p className="text-ink-soft">
          Children do not need email accounts. They access ChoreMate with a parent-managed
          household code and optional PIN. Private family pages are not intended for search engines.
        </p>
        <h2 className="text-2xl font-semibold">Data isolation</h2>
        <p className="text-ink-soft">
          Household data is scoped to the owning parent account. Families cannot see each
          other&apos;s information.
        </p>
        <h2 className="text-2xl font-semibold">Contact</h2>
        <p className="text-ink-soft">
          For privacy questions about your household data, contact the site operator using
          the email associated with your deployment.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

import { SettingsForm } from "@/components/manage-forms";
import { requireOwnedHousehold } from "@/lib/auth/parent";

export const metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const { household } = await requireOwnedHousehold();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-sora), sans-serif" }}>
          Settings
        </h1>
        <p className="text-ink-soft">Approval rules and kid access — keep it simple.</p>
      </div>
      <SettingsForm
        name={household.name}
        requireApproval={household.require_approval}
        kidCode={household.kid_access_code}
      />
    </div>
  );
}

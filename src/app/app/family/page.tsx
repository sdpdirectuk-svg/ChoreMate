import { FamilyManager } from "@/components/manage-forms";
import { getHouseholdChildren, requireOwnedHousehold } from "@/lib/auth/parent";

export const metadata = {
  title: "Family members",
  robots: { index: false, follow: false },
};

export default async function FamilyPage() {
  const { household, supabase } = await requireOwnedHousehold();
  const children = await getHouseholdChildren(supabase, household.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-sora), sans-serif" }}>
          Family members
        </h1>
        <p className="text-ink-soft">
          Friendly profiles with optional PIN. Points and progress live here.
        </p>
      </div>
      <FamilyManager members={children} />
    </div>
  );
}

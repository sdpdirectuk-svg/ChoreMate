import { RewardsManager } from "@/components/manage-forms";
import { requireOwnedHousehold } from "@/lib/auth/parent";
import type { Reward } from "@/lib/types";

export const metadata = {
  title: "Manage rewards",
  robots: { index: false, follow: false },
};

export default async function RewardsPage() {
  const { household, supabase } = await requireOwnedHousehold();
  const { data } = await supabase
    .from("rewards")
    .select("*")
    .eq("household_id", household.id)
    .order("sort_order");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-sora), sans-serif" }}>
          Rewards
        </h1>
        <p className="text-ink-soft">
          Example ideas are fine to keep — or swap them for what your family actually loves.
        </p>
      </div>
      <RewardsManager rewards={(data as Reward[]) ?? []} />
    </div>
  );
}

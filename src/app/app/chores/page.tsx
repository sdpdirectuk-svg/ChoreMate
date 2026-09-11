import { ChoresManager } from "@/components/manage-forms";
import { requireOwnedHousehold } from "@/lib/auth/parent";
import type { Chore } from "@/lib/types";

export const metadata = {
  title: "Manage chores",
  robots: { index: false, follow: false },
};

export default async function ChoresPage() {
  const { household, supabase } = await requireOwnedHousehold();
  const { data } = await supabase
    .from("chores")
    .select("*")
    .eq("household_id", household.id)
    .order("sort_order");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-sora), sans-serif" }}>
          Chores
        </h1>
        <p className="text-ink-soft">Edit points, frequency, or add new chores anytime.</p>
      </div>
      <ChoresManager chores={(data as Chore[]) ?? []} />
    </div>
  );
}

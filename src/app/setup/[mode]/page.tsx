import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-chrome";
import { SetupWizard } from "@/components/setup-wizard";
import { getOwnedHousehold, requireParentUser } from "@/lib/auth/parent";
import type { SuggestedChore, SuggestedReward } from "@/lib/defaults";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Setup wizard",
  robots: { index: false, follow: false },
};

export default async function SetupModePage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  await requireParentUser();
  const { mode } = await params;
  if (mode !== "quick" && mode !== "custom") notFound();

  const { household, supabase } = await getOwnedHousehold();
  if (!household) redirect("/setup");
  if (household.setup_completed) redirect("/app");

  const [{ data: chores }, { data: rewards }] = await Promise.all([
    supabase
      .from("chores")
      .select("title, points, frequency")
      .eq("household_id", household.id)
      .order("sort_order"),
    supabase
      .from("rewards")
      .select("title, points_required, icon")
      .eq("household_id", household.id)
      .order("sort_order"),
  ]);

  const existingChores: SuggestedChore[] =
    chores?.map((c) => ({
      title: c.title,
      points: c.points,
      frequency: c.frequency,
    })) ?? [];

  const existingRewards: SuggestedReward[] =
    rewards?.map((r) => ({
      title: r.title,
      pointsRequired: r.points_required,
      icon: r.icon,
    })) ?? [];

  return (
    <div className="min-h-full">
      <SiteHeader compact />
      <main className="cm-shell py-10">
        <SetupWizard
          mode={mode}
          existingChores={existingChores}
          existingRewards={existingRewards}
        />
      </main>
    </div>
  );
}

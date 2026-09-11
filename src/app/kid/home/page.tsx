import { redirect } from "next/navigation";
import { KidHomeClient } from "@/components/kid-experience";
import { getChildSession } from "@/lib/auth/child-session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isChoreAvailableToday,
  nextReward,
  todayEarnedPoints,
} from "@/lib/chores-logic";
import type { Chore, ChoreCompletion, Member, Reward } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your chores",
  robots: { index: false, follow: false },
};

export default async function KidHomePage() {
  const session = await getChildSession();
  if (!session) redirect("/kid");

  const admin = createAdminClient();
  const [{ data: member }, { data: chores }, { data: rewards }, { data: completions }, { data: redemptions }] =
    await Promise.all([
      admin
        .from("members")
        .select("*")
        .eq("id", session.memberId)
        .eq("household_id", session.householdId)
        .single(),
      admin
        .from("chores")
        .select("*")
        .eq("household_id", session.householdId)
        .eq("active", true)
        .order("sort_order"),
      admin
        .from("rewards")
        .select("*")
        .eq("household_id", session.householdId)
        .eq("active", true)
        .order("sort_order"),
      admin
        .from("chore_completions")
        .select("*")
        .eq("household_id", session.householdId)
        .eq("member_id", session.memberId)
        .order("completed_at", { ascending: false })
        .limit(120),
      admin
        .from("reward_redemptions")
        .select("*")
        .eq("household_id", session.householdId)
        .eq("member_id", session.memberId)
        .eq("status", "pending"),
    ]);

  if (!member) redirect("/kid");

  const typedMember = member as Member;
  const typedChores = (chores as Chore[]) ?? [];
  const typedRewards = (rewards as Reward[]) ?? [];
  const typedCompletions = (completions as ChoreCompletion[]) ?? [];
  const pendingRewardIds = new Set((redemptions ?? []).map((r) => r.reward_id));

  const choreRows = typedChores.map((chore) => {
    const pending = typedCompletions.some(
      (c) => c.chore_id === chore.id && c.status === "pending",
    );
    return {
      id: chore.id,
      title: chore.title,
      points: chore.points,
      available: isChoreAvailableToday(chore, typedCompletions, typedMember.id),
      pending,
    };
  });

  const upcoming = nextReward(typedRewards, typedMember.points);

  return (
    <div className="min-h-full">
      <main className="cm-shell py-6">
        <KidHomeClient
          name={typedMember.name}
          avatar={typedMember.avatar}
          points={typedMember.points}
          todayPoints={todayEarnedPoints(typedCompletions, typedMember.id)}
          chores={choreRows}
          rewards={typedRewards.map((reward) => ({
            id: reward.id,
            title: reward.title,
            icon: reward.icon,
            pointsRequired: reward.points_required,
            requested: pendingRewardIds.has(reward.id),
          }))}
          next={
            upcoming
              ? {
                  title: upcoming.reward.title,
                  required: upcoming.reward.points_required,
                  remaining: upcoming.remaining,
                }
              : null
          }
        />
      </main>
    </div>
  );
}

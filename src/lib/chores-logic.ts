import { isToday, isThisWeek, parseISO } from "date-fns";
import type { Chore, ChoreCompletion, Reward } from "@/lib/types";

export function isChoreAvailableToday(
  chore: Chore,
  completions: ChoreCompletion[],
  memberId: string,
): boolean {
  const relevant = completions.filter(
    (c) =>
      c.chore_id === chore.id &&
      c.member_id === memberId &&
      c.status !== "rejected",
  );

  if (chore.frequency === "one_off") {
    return relevant.length === 0;
  }

  if (chore.frequency === "daily") {
    return !relevant.some((c) => isToday(parseISO(c.completed_at)));
  }

  if (chore.frequency === "weekly") {
    return !relevant.some((c) => isThisWeek(parseISO(c.completed_at), { weekStartsOn: 1 }));
  }

  return true;
}

export function todayApprovedCount(
  completions: ChoreCompletion[],
  memberId: string,
): number {
  return completions.filter(
    (c) =>
      c.member_id === memberId &&
      c.status === "approved" &&
      isToday(parseISO(c.completed_at)),
  ).length;
}

export function todayEarnedPoints(
  completions: ChoreCompletion[],
  memberId: string,
): number {
  return completions
    .filter(
      (c) =>
        c.member_id === memberId &&
        c.status === "approved" &&
        isToday(parseISO(c.completed_at)),
    )
    .reduce((sum, c) => sum + c.points, 0);
}

export function pendingCountForMember(
  completions: ChoreCompletion[],
  memberId: string,
): number {
  return completions.filter(
    (c) => c.member_id === memberId && c.status === "pending",
  ).length;
}

export function nextReward(
  rewards: Reward[],
  points: number,
): { reward: Reward; remaining: number } | null {
  const active = [...rewards]
    .filter((r) => r.active)
    .sort((a, b) => a.points_required - b.points_required);

  const upcoming = active.find((r) => r.points_required > points);
  if (upcoming) {
    return { reward: upcoming, remaining: upcoming.points_required - points };
  }

  const last = active[active.length - 1];
  if (!last) return null;
  return { reward: last, remaining: Math.max(0, last.points_required - points) };
}

export function redeemableRewards(rewards: Reward[], points: number): Reward[] {
  return rewards
    .filter((r) => r.active && r.points_required <= points)
    .sort((a, b) => a.points_required - b.points_required);
}

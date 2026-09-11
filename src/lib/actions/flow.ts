"use server";

import { revalidatePath } from "next/cache";
import { requireOwnedHousehold } from "@/lib/auth/parent";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createChildSessionToken,
  getChildSession,
  setChildSessionCookie,
  clearChildSessionCookie,
  verifyPin,
} from "@/lib/auth/child-session";
import { isChoreAvailableToday } from "@/lib/chores-logic";
import type { ActionResult } from "@/lib/actions/auth-setup";
import { publicErrorMessage } from "@/lib/safe";
import type { Chore, ChoreCompletion, Member, Reward } from "@/lib/types";

function revalidateAll() {
  revalidatePath("/app");
  revalidatePath("/kid");
  revalidatePath("/kid/home");
}

async function awardPoints(opts: {
  householdId: string;
  memberId: string;
  delta: number;
  reason: string;
  refType: string;
  refId: string;
  createdBy?: string | null;
}) {
  const admin = createAdminClient();
  const { data: member, error: memberError } = await admin
    .from("members")
    .select("points")
    .eq("id", opts.memberId)
    .eq("household_id", opts.householdId)
    .single();

  if (memberError || !member) {
    throw new Error(memberError?.message || "Member not found.");
  }

  const nextPoints = Math.max(0, (member.points as number) + opts.delta);
  const { error: updateError } = await admin
    .from("members")
    .update({ points: nextPoints })
    .eq("id", opts.memberId)
    .eq("household_id", opts.householdId);
  if (updateError) throw new Error(updateError.message);

  const { error: ledgerError } = await admin.from("point_ledger").insert({
    household_id: opts.householdId,
    member_id: opts.memberId,
    delta: opts.delta,
    reason: opts.reason,
    ref_type: opts.refType,
    ref_id: opts.refId,
    created_by: opts.createdBy ?? null,
  });
  if (ledgerError) throw new Error(ledgerError.message);

  return nextPoints;
}

export async function lookupKidHousehold(code: string) {
  try {
    const admin = createAdminClient();
    const normalized = code.trim().toUpperCase();
    const { data, error } = await admin.rpc("list_child_profiles_by_kid_code", {
      code: normalized,
    });
    if (error) {
      return {
        ok: false as const,
        error: "Could not look up that family right now. Please try again.",
      };
    }
    if (!data?.length) {
      return {
        ok: false as const,
        error:
          "No family found for that code. Ask a parent for the Kid Access Code.",
      };
    }
    return {
      ok: true as const,
      householdId: data[0].household_id as string,
      children: data as {
        id: string;
        household_id: string;
        name: string;
        avatar: string;
        points: number;
        has_pin: boolean;
      }[],
    };
  } catch {
    return {
      ok: false as const,
      error: "Could not look up that family right now. Please try again.",
    };
  }
}

export async function startChildSession(input: {
  code: string;
  memberId: string;
  pin?: string;
}): Promise<ActionResult> {
  try {
    const result = await lookupKidHousehold(input.code);
    if (!result.ok) return result;

    const child = result.children.find((c) => c.id === input.memberId);
    if (!child) return { ok: false, error: "Choose a profile from this family." };

    const admin = createAdminClient();
    const { data: member, error } = await admin
      .from("members")
      .select("*")
      .eq("id", child.id)
      .eq("household_id", result.householdId)
      .eq("role", "child")
      .single();

    if (error || !member) {
      return { ok: false, error: "Profile not found." };
    }

    const typed = member as Member;
    if (typed.pin_hash) {
      if (!input.pin || !verifyPin(input.pin, result.householdId, typed.pin_hash)) {
        return { ok: false, error: "Incorrect PIN." };
      }
    }

    const token = await createChildSessionToken({
      householdId: result.householdId,
      memberId: typed.id,
      memberName: typed.name,
    });
    await setChildSessionCookie(token);
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function endChildSession() {
  await clearChildSessionCookie();
  revalidateAll();
}

export async function completeChoreAsChild(choreId: string): Promise<
  ActionResult & { status?: "pending" | "approved" }
> {
  try {
    const session = await getChildSession();
    if (!session) return { ok: false, error: "Child session expired. Sign in again." };

    const admin = createAdminClient();
    const [{ data: household }, { data: chore }, { data: recent }] =
      await Promise.all([
        admin
          .from("households")
          .select("*")
          .eq("id", session.householdId)
          .single(),
        admin
          .from("chores")
          .select("*")
          .eq("id", choreId)
          .eq("household_id", session.householdId)
          .eq("active", true)
          .single(),
        admin
          .from("chore_completions")
          .select("*")
          .eq("household_id", session.householdId)
          .eq("member_id", session.memberId)
          .order("completed_at", { ascending: false })
          .limit(100),
      ]);

    if (!household || !chore) {
      return { ok: false, error: "Chore not available." };
    }

    const typedChore = chore as Chore;
    const completions = (recent as ChoreCompletion[]) ?? [];
    if (!isChoreAvailableToday(typedChore, completions, session.memberId)) {
      return { ok: false, error: "That chore is already done for now." };
    }

    const requireApproval = Boolean(household.require_approval);
    const status = requireApproval ? "pending" : "approved";

    const { data: completion, error } = await admin
      .from("chore_completions")
      .insert({
        household_id: session.householdId,
        chore_id: typedChore.id,
        member_id: session.memberId,
        points: typedChore.points,
        status,
        resolved_at: requireApproval ? null : new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error || !completion) {
      return { ok: false, error: error?.message || "Could not save completion." };
    }

    if (!requireApproval) {
      await awardPoints({
        householdId: session.householdId,
        memberId: session.memberId,
        delta: typedChore.points,
        reason: `Completed: ${typedChore.title}`,
        refType: "chore_completion",
        refId: completion.id,
      });
    }

    revalidateAll();
    return { ok: true, status };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function requestRewardAsChild(rewardId: string): Promise<ActionResult> {
  try {
    const session = await getChildSession();
    if (!session) return { ok: false, error: "Child session expired. Sign in again." };

    const admin = createAdminClient();
    const [{ data: member }, { data: reward }, { data: pending }] =
      await Promise.all([
        admin
          .from("members")
          .select("*")
          .eq("id", session.memberId)
          .single(),
        admin
          .from("rewards")
          .select("*")
          .eq("id", rewardId)
          .eq("household_id", session.householdId)
          .eq("active", true)
          .single(),
        admin
          .from("reward_redemptions")
          .select("id")
          .eq("member_id", session.memberId)
          .eq("reward_id", rewardId)
          .eq("status", "pending")
          .limit(1),
      ]);

    if (!member || !reward) {
      return { ok: false, error: "Reward not available." };
    }

    const typedReward = reward as Reward;
    const typedMember = member as Member;

    if (typedMember.points < typedReward.points_required) {
      return { ok: false, error: "Not enough points yet." };
    }
    if (pending?.length) {
      return { ok: false, error: "You already requested this reward." };
    }

    const { error } = await admin.from("reward_redemptions").insert({
      household_id: session.householdId,
      reward_id: typedReward.id,
      member_id: session.memberId,
      points_spent: typedReward.points_required,
      status: "pending",
    });
    if (error) return { ok: false, error: error.message };

    revalidateAll();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function resolveCompletion(input: {
  completionId: string;
  decision: "approved" | "rejected";
}): Promise<ActionResult> {
  try {
    const { household, supabase, userId } = await requireOwnedHousehold();
    const admin = createAdminClient();

    const { data: completion, error } = await admin
      .from("chore_completions")
      .select("*, chores(title)")
      .eq("id", input.completionId)
      .eq("household_id", household.id)
      .single();

    if (error || !completion) {
      return { ok: false, error: "Completion not found." };
    }
    if (completion.status !== "pending") {
      return { ok: false, error: "Already resolved." };
    }

    const { error: updateError } = await admin
      .from("chore_completions")
      .update({
        status: input.decision,
        resolved_at: new Date().toISOString(),
        resolved_by: userId,
      })
      .eq("id", completion.id);
    if (updateError) return { ok: false, error: updateError.message };

    if (input.decision === "approved") {
      const title =
        (completion.chores as { title?: string } | null)?.title || "chore";
      await awardPoints({
        householdId: household.id,
        memberId: completion.member_id,
        delta: completion.points,
        reason: `Approved: ${title}`,
        refType: "chore_completion",
        refId: completion.id,
        createdBy: userId,
      });
    }

    void supabase;
    revalidateAll();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function undoCompletion(completionId: string): Promise<ActionResult> {
  try {
    const { household, userId } = await requireOwnedHousehold();
    const admin = createAdminClient();

    const { data: completion, error } = await admin
      .from("chore_completions")
      .select("*, chores(title)")
      .eq("id", completionId)
      .eq("household_id", household.id)
      .single();

    if (error || !completion) {
      return { ok: false, error: "Completion not found." };
    }

    if (completion.status === "approved") {
      await awardPoints({
        householdId: household.id,
        memberId: completion.member_id,
        delta: -completion.points,
        reason: `Undo: ${(completion.chores as { title?: string } | null)?.title || "chore"}`,
        refType: "chore_completion_undo",
        refId: completion.id,
        createdBy: userId,
      });
    }

    const { error: deleteError } = await admin
      .from("chore_completions")
      .delete()
      .eq("id", completion.id);
    if (deleteError) return { ok: false, error: deleteError.message };

    revalidateAll();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function resolveRedemption(input: {
  redemptionId: string;
  decision: "confirmed" | "rejected";
}): Promise<ActionResult> {
  try {
    const { household, userId } = await requireOwnedHousehold();
    const admin = createAdminClient();

    const { data: redemption, error } = await admin
      .from("reward_redemptions")
      .select("*, rewards(title)")
      .eq("id", input.redemptionId)
      .eq("household_id", household.id)
      .single();

    if (error || !redemption) {
      return { ok: false, error: "Request not found." };
    }
    if (redemption.status !== "pending") {
      return { ok: false, error: "Already resolved." };
    }

    if (input.decision === "confirmed") {
      const { data: member } = await admin
        .from("members")
        .select("points")
        .eq("id", redemption.member_id)
        .single();

      if (!member || member.points < redemption.points_spent) {
        return { ok: false, error: "Not enough points to confirm this reward." };
      }

      await awardPoints({
        householdId: household.id,
        memberId: redemption.member_id,
        delta: -redemption.points_spent,
        reason: `Reward: ${(redemption.rewards as { title?: string } | null)?.title || "reward"}`,
        refType: "reward_redemption",
        refId: redemption.id,
        createdBy: userId,
      });
    }

    const { error: updateError } = await admin
      .from("reward_redemptions")
      .update({
        status: input.decision,
        resolved_at: new Date().toISOString(),
        resolved_by: userId,
      })
      .eq("id", redemption.id);
    if (updateError) return { ok: false, error: updateError.message };

    revalidateAll();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  generateKidAccessCode,
  type SuggestedChore,
  type SuggestedReward,
} from "@/lib/defaults";
import { clearChildSessionCookie } from "@/lib/auth/child-session";
import { getOwnedHousehold, requireParentUser } from "@/lib/auth/parent";
import { publicErrorMessage, safeInternalPath } from "@/lib/safe";
import { createClient } from "@/lib/supabase/server";

const setupChoiceSchema = z.object({
  mode: z.enum(["quick", "custom"]),
  householdName: z
    .string()
    .trim()
    .max(60)
    .transform((value) => (value.length > 0 ? value : "Our family")),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function signUpParent(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || password.length < 8) {
    return { ok: false, error: "Use a valid email and a password of at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name || "Parent" },
    },
  });

  if (error) {
    return { ok: false, error: publicErrorMessage(error, "Could not create account.") };
  }
  if (!data.user) return { ok: false, error: "Could not create account." };

  if (!data.session) {
    return {
      ok: false,
      error:
        "Account created. Check your email to confirm your address, then sign in.",
    };
  }

  redirect("/setup");
}

export async function signInParent(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeInternalPath(String(formData.get("next") ?? "/app"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      ok: false,
      error: publicErrorMessage(error, "Incorrect email or password."),
    };
  }

  const { data: household } = await supabase
    .from("households")
    .select("setup_completed")
    .eq("owner_id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!household?.setup_completed) {
    redirect("/setup");
  }

  redirect(next);
}

export async function signOutParent() {
  const supabase = await createClient();
  await clearChildSessionCookie();
  await supabase.auth.signOut();
  redirect("/");
}

export async function startSetup(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = setupChoiceSchema.parse({
      mode: formData.get("mode"),
      householdName: formData.get("householdName") || "Our family",
    });

    const { user } = await requireParentUser();
    const existing = await getOwnedHousehold();
    if (existing.household?.setup_completed) {
      redirect("/app");
    }

    const supabase = existing.supabase;
    let householdId = existing.household?.id;

    if (!householdId) {
      const { data, error } = await supabase
        .from("households")
        .insert({
          owner_id: user.id,
          name: parsed.householdName,
          setup_mode: parsed.mode,
          require_approval: true,
          kid_access_code: generateKidAccessCode(),
          setup_completed: false,
        })
        .select("id")
        .single();

      if (error) return { ok: false, error: error.message };
      householdId = data.id;
    } else {
      const { error } = await supabase
        .from("households")
        .update({
          name: parsed.householdName,
          setup_mode: parsed.mode,
        })
        .eq("id", householdId);
      if (error) return { ok: false, error: error.message };
    }

    redirect(`/setup/${parsed.mode}`);
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Setup failed.",
    };
  }
}

export async function saveSetupChores(input: {
  chores: SuggestedChore[];
}): Promise<ActionResult> {
  try {
    const { household, supabase } = await getOwnedHousehold();
    if (!household) return { ok: false, error: "Start setup first." };

    await supabase.from("chores").delete().eq("household_id", household.id);

    if (input.chores.length > 0) {
      const { error } = await supabase.from("chores").insert(
        input.chores.map((chore, index) => ({
          household_id: household.id,
          title: chore.title.trim(),
          points: chore.points,
          frequency: chore.frequency,
          active: true,
          sort_order: index,
        })),
      );
      if (error) return { ok: false, error: error.message };
    }

    revalidatePath("/setup");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed." };
  }
}

export async function saveSetupRewards(input: {
  rewards: SuggestedReward[];
}): Promise<ActionResult> {
  try {
    const { household, supabase } = await getOwnedHousehold();
    if (!household) return { ok: false, error: "Start setup first." };

    await supabase.from("rewards").delete().eq("household_id", household.id);

    if (input.rewards.length > 0) {
      const { error } = await supabase.from("rewards").insert(
        input.rewards.map((reward, index) => ({
          household_id: household.id,
          title: reward.title.trim(),
          points_required: reward.pointsRequired,
          icon: reward.icon,
          active: true,
          sort_order: index,
        })),
      );
      if (error) return { ok: false, error: error.message };
    }

    revalidatePath("/setup");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed." };
  }
}

export async function saveSetupMembers(input: {
  members: { name: string; avatar: string }[];
}): Promise<ActionResult> {
  try {
    const { household, supabase, userId } = await getOwnedHousehold();
    if (!household) return { ok: false, error: "Start setup first." };

    if (input.members.length === 0) {
      return { ok: false, error: "Add at least one child or family member." };
    }

    await supabase
      .from("members")
      .delete()
      .eq("household_id", household.id)
      .eq("role", "child");

    const { error: childError } = await supabase.from("members").insert(
      input.members.map((m) => ({
        household_id: household.id,
        name: m.name.trim(),
        avatar: m.avatar,
        role: "child",
        points: 0,
      })),
    );
    if (childError) return { ok: false, error: childError.message };

    // Ensure a parent profile exists for the account holder.
    const { data: parents } = await supabase
      .from("members")
      .select("id")
      .eq("household_id", household.id)
      .eq("role", "parent")
      .limit(1);

    if (!parents?.length) {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("members").insert({
        household_id: household.id,
        name: (userData.user?.user_metadata?.full_name as string) || "Parent",
        avatar: "star",
        role: "parent",
        points: 0,
      });
    }

    void userId;
    revalidatePath("/setup");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed." };
  }
}

export async function completeSetup(): Promise<ActionResult> {
  try {
    const { household, supabase } = await getOwnedHousehold();
    if (!household) return { ok: false, error: "Start setup first." };

    const [{ count: choreCount }, { count: rewardCount }, { count: childCount }] =
      await Promise.all([
        supabase
          .from("chores")
          .select("*", { count: "exact", head: true })
          .eq("household_id", household.id)
          .eq("active", true),
        supabase
          .from("rewards")
          .select("*", { count: "exact", head: true })
          .eq("household_id", household.id)
          .eq("active", true),
        supabase
          .from("members")
          .select("*", { count: "exact", head: true })
          .eq("household_id", household.id)
          .eq("role", "child"),
      ]);

    if (!childCount) {
      return { ok: false, error: "Add at least one child before finishing." };
    }
    if (!choreCount) {
      return { ok: false, error: "Add at least one chore before finishing." };
    }
    if (!rewardCount) {
      return { ok: false, error: "Add at least one reward before finishing." };
    }

    const { error } = await supabase
      .from("households")
      .update({ setup_completed: true })
      .eq("id", household.id);

    if (error) return { ok: false, error: error.message };

    redirect("/app");
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return { ok: false, error: err instanceof Error ? err.message : "Failed." };
  }
}

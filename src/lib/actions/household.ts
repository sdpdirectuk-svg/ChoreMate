"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwnedHousehold } from "@/lib/auth/parent";
import { generateKidAccessCode } from "@/lib/defaults";
import { hashPin } from "@/lib/auth/child-session";
import type { ActionResult } from "@/lib/actions/auth-setup";
import { publicErrorMessage } from "@/lib/safe";

function revalidateApp() {
  revalidatePath("/app");
  revalidatePath("/app/chores");
  revalidatePath("/app/rewards");
  revalidatePath("/app/family");
  revalidatePath("/app/settings");
  revalidatePath("/kid");
}

const choreSchema = z.object({
  title: z.string().trim().min(1).max(80),
  points: z.coerce.number().int().min(1).max(1000),
  frequency: z.enum(["daily", "weekly", "one_off"]),
});

const rewardSchema = z.object({
  title: z.string().trim().min(1).max(80),
  pointsRequired: z.coerce.number().int().min(1).max(100000),
  icon: z.string().trim().min(1).max(32).default("gift"),
});

export async function createChore(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = choreSchema.parse({
      title: formData.get("title"),
      points: formData.get("points"),
      frequency: formData.get("frequency"),
    });
    const { household, supabase } = await requireOwnedHousehold();
    const { count } = await supabase
      .from("chores")
      .select("*", { count: "exact", head: true })
      .eq("household_id", household.id);

    const { error } = await supabase.from("chores").insert({
      household_id: household.id,
      title: parsed.title,
      points: parsed.points,
      frequency: parsed.frequency,
      active: true,
      sort_order: count ?? 0,
    });
    if (error) return { ok: false, error: error.message };
    revalidateApp();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function updateChore(formData: FormData): Promise<ActionResult> {
  try {
    const id = String(formData.get("id") ?? "");
    const parsed = choreSchema.parse({
      title: formData.get("title"),
      points: formData.get("points"),
      frequency: formData.get("frequency"),
    });
    const active = formData.get("active") !== "false";
    const { household, supabase } = await requireOwnedHousehold();
    const { error } = await supabase
      .from("chores")
      .update({
        title: parsed.title,
        points: parsed.points,
        frequency: parsed.frequency,
        active,
      })
      .eq("id", id)
      .eq("household_id", household.id);
    if (error) return { ok: false, error: error.message };
    revalidateApp();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function deleteChore(formData: FormData): Promise<ActionResult> {
  try {
    const id = String(formData.get("id") ?? "");
    const { household, supabase } = await requireOwnedHousehold();
    const { error } = await supabase
      .from("chores")
      .delete()
      .eq("id", id)
      .eq("household_id", household.id);
    if (error) return { ok: false, error: error.message };
    revalidateApp();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function createReward(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = rewardSchema.parse({
      title: formData.get("title"),
      pointsRequired: formData.get("pointsRequired"),
      icon: formData.get("icon") || "gift",
    });
    const { household, supabase } = await requireOwnedHousehold();
    const { count } = await supabase
      .from("rewards")
      .select("*", { count: "exact", head: true })
      .eq("household_id", household.id);

    const { error } = await supabase.from("rewards").insert({
      household_id: household.id,
      title: parsed.title,
      points_required: parsed.pointsRequired,
      icon: parsed.icon,
      active: true,
      sort_order: count ?? 0,
    });
    if (error) return { ok: false, error: error.message };
    revalidateApp();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function updateReward(formData: FormData): Promise<ActionResult> {
  try {
    const id = String(formData.get("id") ?? "");
    const parsed = rewardSchema.parse({
      title: formData.get("title"),
      pointsRequired: formData.get("pointsRequired"),
      icon: formData.get("icon") || "gift",
    });
    const active = formData.get("active") !== "false";
    const { household, supabase } = await requireOwnedHousehold();
    const { error } = await supabase
      .from("rewards")
      .update({
        title: parsed.title,
        points_required: parsed.pointsRequired,
        icon: parsed.icon,
        active,
      })
      .eq("id", id)
      .eq("household_id", household.id);
    if (error) return { ok: false, error: error.message };
    revalidateApp();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function deleteReward(formData: FormData): Promise<ActionResult> {
  try {
    const id = String(formData.get("id") ?? "");
    const { household, supabase } = await requireOwnedHousehold();
    const { error } = await supabase
      .from("rewards")
      .delete()
      .eq("id", id)
      .eq("household_id", household.id);
    if (error) return { ok: false, error: error.message };
    revalidateApp();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function createMember(formData: FormData): Promise<ActionResult> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    const avatar = String(formData.get("avatar") ?? "star");
    const pin = String(formData.get("pin") ?? "").trim();
    if (!name) return { ok: false, error: "Name is required." };
    if (pin && !/^\d{4}$/.test(pin)) {
      return { ok: false, error: "PIN must be 4 digits, or leave blank." };
    }

    const { household, supabase } = await requireOwnedHousehold();
    const { error } = await supabase.from("members").insert({
      household_id: household.id,
      name,
      avatar,
      role: "child",
      points: 0,
      pin_hash: pin ? hashPin(pin, household.id) : null,
    });
    if (error) return { ok: false, error: error.message };
    revalidateApp();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function updateMember(formData: FormData): Promise<ActionResult> {
  try {
    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const avatar = String(formData.get("avatar") ?? "star");
    const pin = String(formData.get("pin") ?? "").trim();
    const clearPin = formData.get("clearPin") === "true";

    if (!name) return { ok: false, error: "Name is required." };
    if (pin && !/^\d{4}$/.test(pin)) {
      return { ok: false, error: "PIN must be 4 digits, or leave blank." };
    }

    const { household, supabase } = await requireOwnedHousehold();
    const patch: Record<string, unknown> = { name, avatar };
    if (clearPin) patch.pin_hash = null;
    if (pin) patch.pin_hash = hashPin(pin, household.id);

    const { error } = await supabase
      .from("members")
      .update(patch)
      .eq("id", id)
      .eq("household_id", household.id)
      .eq("role", "child");
    if (error) return { ok: false, error: error.message };
    revalidateApp();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function deleteMember(formData: FormData): Promise<ActionResult> {
  try {
    const id = String(formData.get("id") ?? "");
    const { household, supabase } = await requireOwnedHousehold();
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", id)
      .eq("household_id", household.id)
      .eq("role", "child");
    if (error) return { ok: false, error: error.message };
    revalidateApp();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function updateSettings(formData: FormData): Promise<ActionResult> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    const requireApproval = formData.get("requireApproval") === "on";
    if (!name) return { ok: false, error: "Family name is required." };

    const { household, supabase } = await requireOwnedHousehold();
    const { error } = await supabase
      .from("households")
      .update({
        name,
        require_approval: requireApproval,
      })
      .eq("id", household.id);
    if (error) return { ok: false, error: error.message };
    revalidateApp();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

export async function regenerateKidCode(): Promise<ActionResult & { code?: string }> {
  try {
    const { household, supabase } = await requireOwnedHousehold();
    const code = generateKidAccessCode();
    const { error } = await supabase
      .from("households")
      .update({ kid_access_code: code })
      .eq("id", household.id);
    if (error) return { ok: false, error: error.message };
    revalidateApp();
    return { ok: true, code };
  } catch (err) {
    return { ok: false, error: publicErrorMessage(err, "Something went wrong. Please try again.") };
  }
}

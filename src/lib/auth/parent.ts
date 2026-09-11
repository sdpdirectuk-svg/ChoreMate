import { createClient } from "@/lib/supabase/server";
import type { Household, Member } from "@/lib/types";

export async function requireParentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Please sign in to continue.");
  }
  return { supabase, user };
}

export async function getOwnedHousehold(): Promise<{
  household: Household | null;
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
}> {
  const { supabase, user } = await requireParentUser();
  const { data, error } = await supabase
    .from("households")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    household: (data as Household | null) ?? null,
    supabase,
    userId: user.id,
  };
}

export async function requireOwnedHousehold() {
  const result = await getOwnedHousehold();
  if (!result.household) {
    throw new Error("No household found. Finish setup first.");
  }
  return {
    ...result,
    household: result.household,
  };
}

export async function getHouseholdChildren(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("household_id", householdId)
    .eq("role", "child")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Member[]) ?? [];
}

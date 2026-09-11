import { createClient } from "@supabase/supabase-js";
import { getServiceRoleKey, getSupabaseEnv } from "@/lib/env";

/** Service-role client for trusted server paths (child sessions, secure lookups). */
export function createAdminClient() {
  const { url } = getSupabaseEnv();
  return createClient(url, getServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

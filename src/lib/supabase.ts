import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServiceClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase service client requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}

export const SUPABASE_STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET || "tutorial-materials";

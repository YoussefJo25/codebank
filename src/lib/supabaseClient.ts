import { createClient } from "@supabase/supabase-js";

// TEMPORARILY HARDCODED for Vercel deployment testing
const supabaseUrl = "https://zifiigpnymlqvfffaarw.supabase.co";
const supabaseAnonKey = "sb_publishable_SjBcwU-I2Riso-2IFlavmg_0pKpZkfE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ Missing Supabase environment variables! ⚠️\n" +
    "If you are on Vercel, you must add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY " +
    "to your Project Settings -> Environment Variables, and then trigger a NEW deployment."
  );
}

// Fallback to dummy values so the app doesn't crash on load, 
// though actual API calls will fail with 'Failed to fetch' until properly configured.
export const supabase = createClient(
  supabaseUrl || "https://dummy-project.supabase.co",
  supabaseAnonKey || "dummy-key"
);

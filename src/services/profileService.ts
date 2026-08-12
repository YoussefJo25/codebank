import { supabase } from "../lib/supabaseClient";
import type { UserProfile } from "../types";

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const payload = {
    id: userId,
    ...updates,
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(payload);

  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}-${Math.random()}.${fileExt}`;

  // Upload to 'avatars' bucket
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  // Get public URL
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

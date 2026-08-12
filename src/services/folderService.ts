import { supabase } from "../lib/supabaseClient";
import type { Folder } from "../types";

export const fetchFolders = async (): Promise<Folder[]> => {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .order("createdAt", { ascending: true });

  if (error) {
    console.error("Error fetching folders:", error);
    throw new Error(error.message);
  }

  return data as Folder[];
};

export const addFolder = async (folder: Folder): Promise<Folder> => {
  const { data, error } = await supabase
    .from("folders")
    .insert([folder])
    .select()
    .single();

  if (error) {
    console.error("Error adding folder:", error);
    throw new Error(error.message);
  }

  return data as Folder;
};

export const deleteFolder = async (folderId: string): Promise<void> => {
  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId);

  if (error) {
    console.error("Error deleting folder:", error);
    throw new Error(error.message);
  }
};

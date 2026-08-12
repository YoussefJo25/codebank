import { supabase } from "../lib/supabaseClient";
import type { Topic } from "../types";

export const fetchTopics = async (): Promise<Topic[]> => {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("createdAt", { ascending: true });

  if (error) {
    console.error("Error fetching topics:", error);
    throw new Error(error.message);
  }

  return data as Topic[];
};

export const addTopic = async (topic: Topic): Promise<Topic> => {
  const { data, error } = await supabase
    .from("topics")
    .insert([topic])
    .select()
    .single();

  if (error) {
    console.error("Error adding topic:", error);
    throw new Error(error.message);
  }

  return data as Topic;
};

export const updateTopic = async (topicId: string, updates: Partial<Topic>): Promise<Topic> => {
  const { data, error } = await supabase
    .from("topics")
    .update(updates)
    .eq("id", topicId)
    .select()
    .single();

  if (error) {
    console.error("Error updating topic:", error);
    throw new Error(error.message);
  }

  return data as Topic;
};

export const deleteTopic = async (topicId: string): Promise<void> => {
  const { error } = await supabase
    .from("topics")
    .delete()
    .eq("id", topicId);

  if (error) {
    console.error("Error deleting topic:", error);
    throw new Error(error.message);
  }
};

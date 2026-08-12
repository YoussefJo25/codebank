import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { makeId } from "../lib/id";
import { LANGUAGES } from "../lib/languages";
import type { BackupFile, CodeBankData, Folder, Language, Topic, UserProfile } from "../types";
import { fetchFolders, addFolder as addFolderToDb, deleteFolder as deleteFolderFromDb } from "../services/folderService";
import { fetchTopics, addTopic as addTopicToDb, updateTopic as updateTopicInDb, deleteTopic as deleteTopicFromDb } from "../services/topicService";

const DEFAULT_FOLDER_NAME = "بلا تصنيف";

function seedData(): CodeBankData {
  const folderId = makeId();
  const folder: Folder = { id: folderId, name: "Dynamic Programming", createdAt: Date.now() };
  const topic: Topic = {
    id: makeId(),
    folderId,
    title: "أطول متتالية متزايدة (LIS)",
    language: "cpp",
    code: LANGUAGES.cpp.sample,
    explanation:
      "## المسألة\nاكتب هنا نص المسألة كما وردت.\n\n## الفكرة (Approach)\nاشرح هنا خطوات الحل والـ intuition ورا الحل.\n\n## التعقيد الزمني والمكاني\n- Time: O(N log N)\n- Space: O(N)\n",
    tags: ["dp", "binary-search"],
    complexity: "O(N log N)",
    includeInExport: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return { folders: [folder], topics: [topic] };
}

interface StoreState extends CodeBankData {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  selectedTopicId: string | null;
  isLoadingFolders: boolean;
  foldersError: string | null;
  isLoadingTopics: boolean;
  topicsError: string | null;

  setSession: (session: Session | null) => void;
  logout: () => Promise<void>;
  loadFolders: () => Promise<void>;
  loadTopics: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  addFolder: (name: string, parentId?: string | null) => Promise<void>;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => Promise<void>;

  addTopic: (folderId: string, title: string) => Promise<string>;
  updateTopic: (id: string, patch: Partial<Omit<Topic, "id" | "folderId" | "createdAt">>) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  moveTopic: (id: string, folderId: string) => Promise<void>;

  selectTopic: (id: string | null) => void;

  replaceAll: (data: CodeBankData) => void;
  buildBackup: () => BackupFile;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      folders: [],
      topics: [],
      session: null,
      user: null,
      userProfile: null,
      selectedTopicId: null,
      isLoadingFolders: false,
      foldersError: null,
      isLoadingTopics: false,
      topicsError: null,

      setSession: (session) => set({ session, user: session?.user ?? null }),
      
      logout: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null, userProfile: null, folders: [], topics: [], selectedTopicId: null });
      },

      loadUserProfile: async () => {
        const { session } = get();
        if (!session) return;
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          if (!error && data) {
            set({ userProfile: data as UserProfile });
          }
        } catch (err) {
          console.error("Failed to load user profile", err);
        }
      },

      loadTopics: async () => {
        const { session } = get();
        if (!session) return;
        set({ isLoadingTopics: true, topicsError: null });
        try {
          const fetchedTopics = await fetchTopics();
          set({ topics: fetchedTopics, isLoadingTopics: false });
        } catch (err: any) {
          set({ topicsError: err.message || "Failed to load topics", isLoadingTopics: false });
        }
      },

      loadFolders: async () => {
        const { session } = get();
        if (!session) return;
        set({ isLoadingFolders: true, foldersError: null });
        try {
          const fetchedFolders = await fetchFolders();
          set({ folders: fetchedFolders, isLoadingFolders: false });
        } catch (err: any) {
          set({ foldersError: err.message || "Failed to load folders", isLoadingFolders: false });
        }
      },

      addFolder: async (name, parentId = null) => {
        const id = makeId();
        const folder: Folder = { id, parentId, name: name.trim() || DEFAULT_FOLDER_NAME, createdAt: Date.now() };
        
        try {
          // Await the db operation
          await addFolderToDb(folder);
          // Only update UI if db operation is successful
          set((s) => ({ folders: [...s.folders, folder] }));
        } catch (err: any) {
          set({ foldersError: err.message || "Failed to add folder" });
        }
      },

      renameFolder: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((s) => ({
          folders: s.folders.map((f) => (f.id === id ? { ...f, name: trimmed } : f)),
        }));
      },

      deleteFolder: async (id) => {
        try {
          await deleteFolderFromDb(id);
          
          set((s) => {
            // Cascade delete: find all child folder IDs recursively
            const idsToDelete = new Set<string>([id]);
            let newAdded = true;
            while (newAdded) {
              newAdded = false;
              for (const f of s.folders) {
                if (f.parentId && idsToDelete.has(f.parentId) && !idsToDelete.has(f.id)) {
                  idsToDelete.add(f.id);
                  newAdded = true;
                }
              }
            }

            const remainingTopics = s.topics.filter((t) => !idsToDelete.has(t.folderId));
            const remainingFolders = s.folders.filter((f) => !idsToDelete.has(f.id));
            
            const wasSelected = s.selectedTopicId
              ? s.topics.find((t) => t.id === s.selectedTopicId)?.folderId && idsToDelete.has(s.topics.find((t) => t.id === s.selectedTopicId)!.folderId)
              : false;
              
            return {
              folders: remainingFolders,
              topics: remainingTopics,
              selectedTopicId: wasSelected ? null : s.selectedTopicId,
            };
          });
        } catch (err: any) {
          set({ foldersError: err.message || "Failed to delete folder" });
        }
      },

      addTopic: async (folderId, title) => {
        const id = makeId();
        const defaultLang: Language = "cpp";
        const topic: Topic = {
          id,
          folderId,
          title: title.trim() || "مسألة بدون عنوان",
          language: defaultLang,
          code: "",
          explanation: "",
          tags: [],
          complexity: "",
          includeInExport: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        try {
          await addTopicToDb(topic);
          set((s) => ({ topics: [...s.topics, topic], selectedTopicId: id }));
          return id;
        } catch (err: any) {
          set({ topicsError: err.message || "Failed to add topic" });
          return "";
        }
      },

      updateTopic: async (id, patch) => {
        try {
          const updates = { ...patch, updatedAt: Date.now() };
          await updateTopicInDb(id, updates);
          set((s) => ({
            topics: s.topics.map((t) => (t.id === id ? { ...t, ...updates } : t)),
          }));
        } catch (err: any) {
          set({ topicsError: err.message || "Failed to update topic" });
        }
      },

      deleteTopic: async (id) => {
        try {
          await deleteTopicFromDb(id);
          set((s) => ({
            topics: s.topics.filter((t) => t.id !== id),
            selectedTopicId: s.selectedTopicId === id ? null : s.selectedTopicId,
          }));
        } catch (err: any) {
          set({ topicsError: err.message || "Failed to delete topic" });
        }
      },

      moveTopic: async (id, folderId) => {
        try {
          const updates = { folderId, updatedAt: Date.now() };
          await updateTopicInDb(id, updates);
          set((s) => ({
            topics: s.topics.map((t) => (t.id === id ? { ...t, ...updates } : t)),
          }));
        } catch (err: any) {
          set({ topicsError: err.message || "Failed to move topic" });
        }
      },

      selectTopic: (id) => set({ selectedTopicId: id }),

      replaceAll: (data) => set({ folders: data.folders, topics: data.topics, selectedTopicId: null }),

      buildBackup: () => {
        const { folders, topics } = get();
        return { app: "codebank", version: 1, exportedAt: new Date().toISOString(), folders, topics };
      },
    }),
    {
      name: "codebank-storage",
      version: 1,
      partialize: (s) => ({ selectedTopicId: s.selectedTopicId }),
    },
  ),
);

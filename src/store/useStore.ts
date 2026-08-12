import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makeId } from "../lib/id";
import { LANGUAGES } from "../lib/languages";
import type { BackupFile, CodeBankData, Folder, Language, Topic } from "../types";

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
  selectedTopicId: string | null;

  addFolder: (name: string, parentId?: string | null) => string;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;

  addTopic: (folderId: string, title: string) => string;
  updateTopic: (id: string, patch: Partial<Omit<Topic, "id" | "folderId" | "createdAt">>) => void;
  deleteTopic: (id: string) => void;
  moveTopic: (id: string, folderId: string) => void;

  selectTopic: (id: string | null) => void;

  replaceAll: (data: CodeBankData) => void;
  buildBackup: () => BackupFile;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...seedData(),
      selectedTopicId: null,

      addFolder: (name, parentId = null) => {
        const id = makeId();
        const folder: Folder = { id, parentId, name: name.trim() || DEFAULT_FOLDER_NAME, createdAt: Date.now() };
        set((s) => ({ folders: [...s.folders, folder] }));
        return id;
      },

      renameFolder: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((s) => ({
          folders: s.folders.map((f) => (f.id === id ? { ...f, name: trimmed } : f)),
        }));
      },

      deleteFolder: (id) => {
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
      },

      addTopic: (folderId, title) => {
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
        set((s) => ({ topics: [...s.topics, topic], selectedTopicId: id }));
        return id;
      },

      updateTopic: (id, patch) => {
        set((s) => ({
          topics: s.topics.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t)),
        }));
      },

      deleteTopic: (id) => {
        set((s) => ({
          topics: s.topics.filter((t) => t.id !== id),
          selectedTopicId: s.selectedTopicId === id ? null : s.selectedTopicId,
        }));
      },

      moveTopic: (id, folderId) => {
        set((s) => ({
          topics: s.topics.map((t) => (t.id === id ? { ...t, folderId, updatedAt: Date.now() } : t)),
        }));
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
      partialize: (s) => ({ folders: s.folders, topics: s.topics, selectedTopicId: s.selectedTopicId }),
    },
  ),
);

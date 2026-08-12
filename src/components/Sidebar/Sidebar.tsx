import { FolderPlus } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { useStore } from "../../store/useStore";
import { FolderNode } from "./FolderNode";
import { TopicRow } from "./TopicRow";

export function Sidebar() {
  const folders = useStore((s) => s.folders);
  const topics = useStore((s) => s.topics);
  const selectedTopicId = useStore((s) => s.selectedTopicId);
  const addFolder = useStore((s) => s.addFolder);

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [addingFolder, setAddingFolder] = useState(false);
  const [draftFolder, setDraftFolder] = useState("");

  const toggleExpand = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const commitAddFolder = () => {
    const name = draftFolder.trim();
    if (name) addFolder(name);
    setDraftFolder("");
    setAddingFolder(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitAddFolder();
    if (e.key === "Escape") {
      setDraftFolder("");
      setAddingFolder(false);
    }
  };

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-e border-ink-600 bg-ink-850">
      <div className="flex items-center justify-between px-4 pb-1 pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-mist-500">الفولدرات</span>
        <button
          onClick={() => setAddingFolder(true)}
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-mist-400 hover:bg-ink-700 hover:text-jade-400"
        >
          <FolderPlus size={13} />
          فولدر جديد
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {addingFolder && (
          <div className="mb-1 px-2 py-1">
            <input
              autoFocus
              value={draftFolder}
              onChange={(e) => setDraftFolder(e.target.value)}
              onBlur={commitAddFolder}
              onKeyDown={onKeyDown}
              placeholder="اسم الفولدر…"
              className="w-full rounded-md border border-jade-500/50 bg-ink-750 px-2.5 py-1.5 text-sm text-mist-100 outline-none placeholder:text-mist-500"
            />
          </div>
        )}

        {folders.length === 0 && !addingFolder ? (
          <div className="mt-6 px-3 text-center text-xs leading-relaxed text-mist-500">
            لا توجد فولدرات بعد.
            <br />
            ابدأ بإنشاء أول فولدر لتنظيم مسائلك.
          </div>
        ) : (
          folders.filter(f => !f.parentId).map((folder) => (
            <FolderNode
              key={folder.id}
              folder={folder}
              allFolders={folders}
              allTopics={topics}
              expanded={!collapsedIds.has(folder.id)}
              onToggleExpand={() => toggleExpand(folder.id)}
              collapsedIds={collapsedIds}
              toggleExpand={toggleExpand}
              selectedTopicId={selectedTopicId}
              depth={0}
            />
          ))
        )}

        {topics.filter((t) => !t.folderId).map((topic) => (
          <TopicRow 
            key={topic.id} 
            topic={topic} 
            active={topic.id === selectedTopicId}
            onSelect={() => useStore.getState().selectTopic(topic.id)}
            onDelete={() => useStore.getState().deleteTopic(topic.id)}
          />
        ))}
      </div>
    </aside>
  );
}

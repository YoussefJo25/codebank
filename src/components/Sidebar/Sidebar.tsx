import { FolderPlus, Mail, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { useStore } from "../../store/useStore";
import { FolderNode } from "./FolderNode";
import { TopicRow } from "./TopicRow";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
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
    <aside className="flex h-full w-72 shrink-0 flex-col border-e border-ink-600 bg-ink-850 shadow-2xl lg:shadow-none">
      <div className="flex items-center justify-between px-4 pb-1 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-mist-500">الفولدرات</span>
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden text-mist-500 hover:text-mist-200"
            >
              <X size={14} />
            </button>
          )}
        </div>
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

      {/* Developer Profile Footer */}
      <div className="border-t border-ink-600 bg-ink-850 p-4 shrink-0">
        <div className="flex flex-col gap-1">
          <h3 className="font-display font-bold text-mist-100 text-sm">Youssef Abdellatif Jo</h3>
          <p className="text-xs text-mist-400">Software Engineer</p>
          <div className="flex items-center gap-3 mt-2">
            <a href="https://github.com/YoussefJo25" target="_blank" rel="noopener noreferrer" className="text-mist-500 hover:text-mist-200 transition-colors" aria-label="GitHub">
              <GithubIcon size={16} />
            </a>
            <a href="https://www.linkedin.com/in/youssef-abdellatif-ai/" target="_blank" rel="noopener noreferrer" className="text-mist-500 hover:text-[#0a66c2] transition-colors" aria-label="LinkedIn">
              <LinkedinIcon size={16} />
            </a>
            <a href="mailto:youssef.abdellatif.ai@gmail.com" target="_blank" rel="noopener noreferrer" className="text-mist-500 hover:text-ember-400 transition-colors" aria-label="Email">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

function GithubIcon({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
  );
}

function LinkedinIcon({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
  );
}

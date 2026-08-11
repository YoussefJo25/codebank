import { ChevronDown, ChevronRight, Folder, FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { useStore } from "../../store/useStore";
import type { Folder as FolderType, Topic } from "../../types";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { TopicRow } from "./TopicRow";

interface FolderNodeProps {
  folder: FolderType;
  topics: Topic[];
  expanded: boolean;
  onToggleExpand: () => void;
  selectedTopicId: string | null;
}

export function FolderNode({ folder, topics, expanded, onToggleExpand, selectedTopicId }: FolderNodeProps) {
  const renameFolder = useStore((s) => s.renameFolder);
  const deleteFolder = useStore((s) => s.deleteFolder);
  const addTopic = useStore((s) => s.addTopic);
  const deleteTopic = useStore((s) => s.deleteTopic);
  const selectTopic = useStore((s) => s.selectTopic);

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(folder.name);
  const [addingTopic, setAddingTopic] = useState(false);
  const [draftTopic, setDraftTopic] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const includedCount = topics.filter((t) => t.includeInExport).length;

  const commitRename = () => {
    if (draftName.trim() && draftName.trim() !== folder.name) {
      renameFolder(folder.id, draftName.trim());
    } else {
      setDraftName(folder.name);
    }
    setEditing(false);
  };

  const onRenameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") {
      setDraftName(folder.name);
      setEditing(false);
    }
  };

  const commitAddTopic = () => {
    const title = draftTopic.trim();
    if (title) {
      addTopic(folder.id, title);
      if (!expanded) onToggleExpand();
    }
    setDraftTopic("");
    setAddingTopic(false);
  };

  const onAddTopicKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitAddTopic();
    if (e.key === "Escape") {
      setDraftTopic("");
      setAddingTopic(false);
    }
  };

  return (
    <div className="mb-0.5">
      <div className="group flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm hover:bg-ink-700">
        <button
          onClick={onToggleExpand}
          className="grid h-5 w-5 shrink-0 place-items-center text-mist-500 hover:text-mist-200"
          aria-label={expanded ? "طي الفولدر" : "فتح الفولدر"}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {expanded ? (
          <FolderOpen size={15} className="shrink-0 text-ember-400" />
        ) : (
          <Folder size={15} className="shrink-0 text-ember-400" />
        )}

        {editing ? (
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={onRenameKeyDown}
            className="min-w-0 flex-1 rounded border border-ember-500/50 bg-ink-750 px-1.5 py-0.5 text-sm text-mist-100 outline-none"
          />
        ) : (
          <button
            onClick={onToggleExpand}
            className="min-w-0 flex-1 truncate text-start font-medium text-mist-100"
            title={folder.name}
          >
            {folder.name}
          </button>
        )}

        <span className="shrink-0 font-mono text-[10px] text-mist-500">
          {includedCount}/{topics.length}
        </span>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setAddingTopic(true)}
            className="rounded p-1 text-mist-500 hover:bg-ink-650 hover:text-jade-400"
            aria-label="إضافة مسألة"
            title="إضافة مسألة جديدة"
          >
            <Plus size={13} />
          </button>
          <button
            onClick={() => setEditing(true)}
            className="rounded p-1 text-mist-500 hover:bg-ink-650 hover:text-mist-100"
            aria-label="إعادة تسمية الفولدر"
            title="إعادة تسمية"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => setConfirmDeleteOpen(true)}
            className="rounded p-1 text-mist-500 hover:bg-coral-500/15 hover:text-coral-400"
            aria-label="حذف الفولدر"
            title="حذف الفولدر"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-0.5">
          {topics.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              active={topic.id === selectedTopicId}
              onSelect={() => selectTopic(topic.id)}
              onDelete={() => deleteTopic(topic.id)}
            />
          ))}

          {addingTopic ? (
            <div className="flex items-center gap-2 py-1 ps-7 pe-2">
              <input
                autoFocus
                value={draftTopic}
                onChange={(e) => setDraftTopic(e.target.value)}
                onBlur={commitAddTopic}
                onKeyDown={onAddTopicKeyDown}
                placeholder="اسم المسألة الجديدة…"
                className="min-w-0 flex-1 rounded border border-jade-500/50 bg-ink-750 px-2 py-1 text-xs text-mist-100 outline-none placeholder:text-mist-500"
              />
            </div>
          ) : (
            topics.length === 0 && (
              <button
                onClick={() => setAddingTopic(true)}
                className="flex w-full items-center gap-2 py-1.5 ps-7 pe-2 text-xs text-mist-500 hover:text-mist-300"
              >
                <Plus size={12} /> إضافة أول مسألة في هذا الفولدر
              </button>
            )
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="حذف الفولدر"
        message={
          topics.length > 0
            ? `هذا الفولدر يحتوي على ${topics.length} مسألة. حذف الفولدر سيحذف كل المسائل بداخله نهائيًا. هل تريد المتابعة؟`
            : `هل أنت متأكد من حذف فولدر "${folder.name}"؟`
        }
        confirmLabel="حذف الفولدر وكل ما بداخله"
        onConfirm={() => {
          deleteFolder(folder.id);
          setConfirmDeleteOpen(false);
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}

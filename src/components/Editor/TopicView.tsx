import { Code2, FileText, FileOutput, Trash2 } from "lucide-react";
import { useState } from "react";
import { useStore } from "../../store/useStore";
import type { Folder, Topic } from "../../types";
import { Button } from "../common/Button";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { CodeEditor } from "./CodeEditor";
import { MarkdownEditor } from "./MarkdownEditor";
import { MetadataPanel } from "./MetadataPanel";

type Tab = "code" | "explanation";

interface TopicViewProps {
  topic: Topic;
  folder: Folder | undefined;
  folders: Folder[];
  onExportTopic: (topicId: string) => void;
}

export function TopicView({ topic, folder, folders, onExportTopic }: TopicViewProps) {
  const updateTopic = useStore((s) => s.updateTopic);
  const deleteTopic = useStore((s) => s.deleteTopic);
  const moveTopic = useStore((s) => s.moveTopic);
  const [tab, setTab] = useState<Tab>("code");
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(topic.title);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const commitTitle = () => {
    const value = draftTitle.trim();
    if (value && value !== topic.title) updateTopic(topic.id, { title: value });
    else setDraftTitle(topic.title);
    setEditingTitle(false);
  };

  const getBreadcrumb = (folderId: string): string => {
    const path: string[] = [];
    let currentId: string | null | undefined = folderId;
    while (currentId) {
      const f = folders.find((f) => f.id === currentId);
      if (f) {
        path.unshift(f.name);
        currentId = f.parentId;
      } else {
        break;
      }
    }
    return path.join(" > ");
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-ink-600 px-6 py-4">
        <div className="min-w-0">
          <div className="mb-1">
            <select
              value={topic.folderId}
              onChange={(e) => moveTopic(topic.id, e.target.value)}
              className="ltr-scope truncate rounded border-none bg-transparent text-[11px] font-medium text-mist-500 outline-none hover:bg-ink-700 focus:bg-ink-700"
              style={{ direction: 'rtl' }}
            >
              {folders.map(f => (
                <option key={f.id} value={f.id}>
                  {getBreadcrumb(f.id)}
                </option>
              ))}
            </select>
          </div>
          {editingTitle ? (
            <input
              autoFocus
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                if (e.key === "Escape") {
                  setDraftTitle(topic.title);
                  setEditingTitle(false);
                }
              }}
              className="w-full max-w-xl rounded-md border border-ember-500/50 bg-ink-750 px-2 py-1 font-display text-xl font-bold text-mist-100 outline-none"
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              title="اضغط لتعديل العنوان"
              className="cursor-text truncate font-display text-xl font-bold text-mist-100 hover:text-ember-300"
            >
              {topic.title}
            </h2>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" icon={<FileOutput size={14} />} onClick={() => onExportTopic(topic.id)}>
            تصدير هذه المسألة
          </Button>
          <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => setConfirmDeleteOpen(true)}>
            حذف
          </Button>
        </div>
      </div>

      <MetadataPanel topic={topic} onChange={(patch) => updateTopic(topic.id, patch)} />

      <div className="flex items-center gap-1 border-b border-ink-600 px-5 pt-2.5">
        <TabButton active={tab === "code"} onClick={() => setTab("code")} icon={<Code2 size={14} />}>
          الكود
        </TabButton>
        <TabButton active={tab === "explanation"} onClick={() => setTab("explanation")} icon={<FileText size={14} />}>
          الشرح
        </TabButton>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-4">
        {tab === "code" ? (
          <CodeEditor
            code={topic.code}
            language={topic.language}
            onChange={(code) => updateTopic(topic.id, { code })}
          />
        ) : (
          <MarkdownEditor
            value={topic.explanation}
            onChange={(explanation) => updateTopic(topic.id, { explanation })}
          />
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="حذف المسألة"
        message={`هل أنت متأكد من حذف "${topic.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف"
        onConfirm={() => {
          deleteTopic(topic.id);
          setConfirmDeleteOpen(false);
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-t-md border-b-2 px-3.5 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-ember-500 text-mist-100"
          : "border-transparent text-mist-500 hover:text-mist-200"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

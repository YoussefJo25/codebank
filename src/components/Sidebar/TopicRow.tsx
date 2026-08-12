import { FileCode2, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Topic } from "../../types";
import { ConfirmDialog } from "../common/ConfirmDialog";

interface TopicRowProps {
  topic: Topic;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  depth?: number;
}

export function TopicRow({ topic, active, onSelect, onDelete, depth = 0 }: TopicRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div
        onClick={onSelect}
        className={`group flex cursor-pointer items-center gap-2 rounded-md py-1.5 pe-2 text-sm transition-colors ${
          active ? "bg-ember-500/12 text-ember-300" : "text-mist-300 hover:bg-ink-700 hover:text-mist-100"
        }`}
        style={{ paddingInlineStart: `${depth + 1.75}rem` }}
      >
        <FileCode2 size={14} className="shrink-0 opacity-70" />
        <span className="min-w-0 flex-1 truncate">{topic.title}</span>
        <span
          title={topic.includeInExport ? "متضمّنة في تصدير الـ PDF" : "غير متضمّنة في التصدير"}
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            topic.includeInExport ? "bg-jade-500" : "bg-ink-500"
          }`}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setConfirmOpen(true);
          }}
          className="shrink-0 rounded p-1 text-mist-500 opacity-0 transition-colors hover:bg-coral-500/15 hover:text-coral-400 group-hover:opacity-100"
          aria-label="حذف المسألة"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="حذف المسألة"
        message={`هل أنت متأكد من حذف "${topic.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف"
        onConfirm={() => {
          onDelete();
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

import { Download, FolderOutput, Library, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useStore } from "../store/useStore";
import type { BackupFile, CodeBankData } from "../types";
import { Button } from "./common/Button";
import { ConfirmDialog } from "./common/ConfirmDialog";

interface HeaderProps {
  onExportAll: () => void;
}

function isValidBackup(data: unknown): data is CodeBankData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return Array.isArray(d.folders) && Array.isArray(d.topics);
}

export function Header({ onExportAll }: HeaderProps) {
  const folders = useStore((s) => s.folders);
  const topics = useStore((s) => s.topics);
  const buildBackup = useStore((s) => s.buildBackup);
  const replaceAll = useStore((s) => s.replaceAll);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingRestore, setPendingRestore] = useState<CodeBankData | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleBackup = () => {
    const backup: BackupFile = buildBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `codebank-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleRestoreClick = () => {
    setRestoreError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      if (!isValidBackup(parsed)) {
        setRestoreError("الملف مش بصيغة نسخة احتياطية صحيحة من CodeBank.");
        return;
      }
      setPendingRestore(parsed);
    } catch {
      setRestoreError("تعذّرت قراءة الملف. تأكد إنه ملف JSON صحيح.");
    }
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-ink-600 bg-ink-850 px-5">
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-ember-500/15 text-ember-400">
          <Library size={17} />
        </div>
        <span className="font-display text-base font-bold text-mist-100">CodeBank</span>
        <span className="hidden text-xs text-mist-500 sm:inline">
          {folders.length} فولدر · {topics.length} مسألة
        </span>
      </div>

      <div className="flex items-center gap-2">
        {restoreError && <span className="text-xs text-coral-400">{restoreError}</span>}
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
        <Button variant="ghost" size="sm" icon={<Upload size={14} />} onClick={handleRestoreClick}>
          استعادة
        </Button>
        <Button variant="ghost" size="sm" icon={<Download size={14} />} onClick={handleBackup}>
          نسخة احتياطية
        </Button>
        <Button variant="primary" size="sm" icon={<FolderOutput size={14} />} onClick={onExportAll}>
          تصدير المرجع الكامل
        </Button>
      </div>

      <ConfirmDialog
        open={!!pendingRestore}
        title="استعادة نسخة احتياطية"
        message={`هتستبدل كل بياناتك الحالية بمحتوى الملف (${pendingRestore?.folders.length ?? 0} فولدر، ${
          pendingRestore?.topics.length ?? 0
        } مسألة). البيانات الحالية هتتمسح ومينفعش نرجعها. متأكد؟`}
        confirmLabel="استبدال البيانات"
        onConfirm={() => {
          if (pendingRestore) replaceAll(pendingRestore);
          setPendingRestore(null);
        }}
        onCancel={() => setPendingRestore(null)}
      />
    </header>
  );
}

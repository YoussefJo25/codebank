import { AlertTriangle, Download, Printer } from "lucide-react";
import { useMemo, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useStore } from "../../store/useStore";
import type { PdfColumns, PdfExportSettings, PdfPageSize, Topic } from "../../types";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { PdfTemplate } from "./PdfTemplate";

export type ExportScope = { type: "all" } | { type: "topic"; topicId: string };

interface ExportModalProps {
  scope: ExportScope | null;
  onClose: () => void;
}

const DEFAULT_SETTINGS: PdfExportSettings = {
  columns: 1,
  codeFontSize: 9,
  pageSize: "A4",
  showPageNumbers: true,
  showHeaders: true,
  title: "مرجع حلول البرمجة التنافسية",
  subtitle: "",
};

export function ExportModal({ scope, onClose }: ExportModalProps) {
  const folders = useStore((s) => s.folders);
  const topics = useStore((s) => s.topics);
  const [settings, setSettings] = useState<PdfExportSettings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");

  const singleTopic: Topic | undefined =
    scope?.type === "topic" ? topics.find((t) => t.id === scope.topicId) : undefined;

  const includedTopics = useMemo(() => topics.filter((t) => t.includeInExport), [topics]);

  const patch = (p: Partial<PdfExportSettings>) => setSettings((s) => ({ ...s, ...p }));

  const contentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: settings.title || "CodeBank-Reference",
    onAfterPrint: () => {
      setStatus("idle");
      onClose();
    },
    onBeforeGetContent: () => {
      setStatus("generating");
      return Promise.resolve();
    }
  });

  const handleExport = () => {
    handlePrint();
  };

  if (!scope) return null;
  const isSingle = scope.type === "topic";
  const exportDisabled = status === "generating" || (!isSingle && includedTopics.length === 0);

  return (
    <Modal
      open={!!scope}
      onClose={onClose}
      title={isSingle ? `تصدير: ${singleTopic?.title ?? ""}` : "تصدير المرجع الكامل"}
      widthClass="max-w-lg"
    >
      <div className="space-y-4">
        {!isSingle && (
          <>
            <Field label="عنوان المرجع">
              <input
                value={settings.title}
                onChange={(e) => patch({ title: e.target.value })}
                className="w-full rounded-md border border-ink-500 bg-ink-750 px-3 py-2 text-sm text-mist-100 outline-none focus:border-ember-500/60"
              />
            </Field>
            <Field label="عنوان فرعي (اختياري)">
              <input
                value={settings.subtitle}
                onChange={(e) => patch({ subtitle: e.target.value })}
                placeholder="مثال: مرجع فريق ICPC"
                className="w-full rounded-md border border-ink-500 bg-ink-750 px-3 py-2 text-sm text-mist-100 outline-none placeholder:text-mist-600 focus:border-ember-500/60"
              />
            </Field>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="عدد الأعمدة">
            <div className="flex gap-2">
              {([1, 2] as PdfColumns[]).map((c) => (
                <button
                  key={c}
                  onClick={() => patch({ columns: c })}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    settings.columns === c
                      ? "border-ember-500/60 bg-ember-500/12 text-ember-300"
                      : "border-ink-500 bg-ink-750 text-mist-300 hover:border-ink-400"
                  }`}
                >
                  {c === 1 ? "عمود واحد" : "عمودين (كثيف)"}
                </button>
              ))}
            </div>
          </Field>

          <Field label="حجم الورقة">
            <div className="flex gap-2">
              {(["A4", "LETTER"] as PdfPageSize[]).map((p) => (
                <button
                  key={p}
                  onClick={() => patch({ pageSize: p })}
                  className={`ltr-scope flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    settings.pageSize === p
                      ? "border-ember-500/60 bg-ember-500/12 text-ember-300"
                      : "border-ink-500 bg-ink-750 text-mist-300 hover:border-ink-400"
                  }`}
                >
                  {p === "A4" ? "A4" : "Letter"}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label={`حجم خط الكود: ${settings.codeFontSize}pt`}>
          <input
            type="range"
            min={7}
            max={12}
            step={0.5}
            value={settings.codeFontSize}
            onChange={(e) => patch({ codeFontSize: Number(e.target.value) })}
            className="w-full accent-ember-500"
          />
        </Field>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-mist-300">
            <input
              type="checkbox"
              checked={settings.showPageNumbers}
              onChange={(e) => patch({ showPageNumbers: e.target.checked })}
              className="h-4 w-4 accent-ember-500"
            />
            ترقيم الصفحات
          </label>
          <label className="flex items-center gap-2 text-sm text-mist-300">
            <input
              type="checkbox"
              checked={settings.showHeaders}
              onChange={(e) => patch({ showHeaders: e.target.checked })}
              className="h-4 w-4 accent-ember-500"
            />
            رأس صفحة متكرر
          </label>
        </div>

        {!isSingle && includedTopics.length === 0 && (
          <div className="flex items-start gap-2 rounded-md border border-coral-500/30 bg-coral-500/10 px-3 py-2 text-xs text-coral-300">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            لا توجد مسائل مُفعّل لها "تضمين في تصدير PDF". فعّل التضمين لمسألة واحدة على الأقل من لوحة الـ Metadata.
          </div>
        )}
        {status === "error" && (
          <div className="rounded-md border border-coral-500/30 bg-coral-500/10 px-3 py-2 text-xs text-coral-300">
            حصل خطأ أثناء إنشاء الملف. جرّب تاني.
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-ink-600 pt-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={exportDisabled}
            onClick={handleExport}
            icon={status === "generating" ? <Printer size={14} className="animate-pulse" /> : <Printer size={14} />}
          >
            {status === "generating" ? "تجهيز الطباعة…" : "طباعة / حفظ كـ PDF"}
          </Button>
        </div>
      </div>
      
      {/* Hidden PDF template for printing */}
      <div className="hidden">
        <PdfTemplate 
          ref={contentRef}
          topics={isSingle && singleTopic ? [singleTopic] : includedTopics}
          folders={folders}
          settings={settings}
          mode={isSingle ? "single" : "full"}
        />
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-mist-400">{label}</span>
      {children}
    </label>
  );
}

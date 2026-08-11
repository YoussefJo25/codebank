import { FileDown, Gauge } from "lucide-react";
import { LANGUAGES, LANGUAGE_ORDER } from "../../lib/languages";
import type { Language, Topic } from "../../types";
import { TagInput } from "../common/TagInput";
import { Toggle } from "../common/Toggle";

interface MetadataPanelProps {
  topic: Topic;
  onChange: (patch: Partial<Topic>) => void;
}

export function MetadataPanel({ topic, onChange }: MetadataPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-ink-600 bg-ink-850 px-5 py-3">
      <label className="flex items-center gap-2">
        <span className="text-xs font-medium text-mist-500">اللغة</span>
        <select
          value={topic.language}
          onChange={(e) => onChange({ language: e.target.value as Language })}
          className="ltr-scope rounded-md border border-ink-500 bg-ink-750 px-2 py-1.5 text-xs font-medium text-mist-100 outline-none focus:border-ember-500/60"
        >
          {LANGUAGE_ORDER.map((lang) => (
            <option key={lang} value={lang}>
              {LANGUAGES[lang].label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-xs font-medium text-mist-500">
          <Gauge size={12} /> التعقيد
        </span>
        <input
          value={topic.complexity}
          onChange={(e) => onChange({ complexity: e.target.value })}
          placeholder="O(N log N)"
          className="ltr-scope w-32 rounded-md border border-ink-500 bg-ink-750 px-2.5 py-1.5 font-mono text-xs text-mist-100 outline-none placeholder:text-mist-600 focus:border-ember-500/60"
        />
      </label>

      <div className="flex min-w-[14rem] flex-1 items-center gap-2">
        <span className="shrink-0 text-xs font-medium text-mist-500">التاجز</span>
        <div className="flex-1">
          <TagInput tags={topic.tags} onChange={(tags) => onChange({ tags })} />
        </div>
      </div>

      <label className="flex shrink-0 items-center gap-2 rounded-md border border-ink-500 bg-ink-750 px-3 py-1.5">
        <FileDown size={13} className={topic.includeInExport ? "text-jade-400" : "text-mist-500"} />
        <span className="text-xs font-medium text-mist-300">تضمين في تصدير PDF</span>
        <Toggle checked={topic.includeInExport} onChange={(v) => onChange({ includeInExport: v })} />
      </label>
    </div>
  );
}

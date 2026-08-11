import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const PLACEHOLDER = `## المسألة (Problem)
اكتب هنا نص المسألة أو رابطها.

## الفكرة (Approach)
اشرح خطوات الحل والـ intuition ورا الحل.

## التعقيد (Complexity)
- Time: O(N)
- Space: O(1)
`;

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <div className="grid h-full grid-cols-2 gap-3">
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-ink-600 bg-ink-850">
        <div className="border-b border-ink-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-mist-500">
          تحرير · Markdown
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          className="ltr-scope flex-1 resize-none bg-transparent p-3.5 font-mono text-[13px] leading-relaxed text-mist-100 outline-none placeholder:text-mist-600"
        />
      </div>

      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-ink-600 bg-ink-800">
        <div className="border-b border-ink-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-mist-500">
          معاينة حية
        </div>
        <div className="md-preview flex-1 overflow-y-auto px-4 py-3.5">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-sm text-mist-600">ستظهر معاينة الشرح هنا أثناء الكتابة…</p>
          )}
        </div>
      </div>
    </div>
  );
}

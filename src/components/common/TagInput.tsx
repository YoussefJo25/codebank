import { useState, type KeyboardEvent } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-ink-500 bg-ink-750 px-2.5 py-2 focus-within:border-ember-500/60">
      {tags.map((tag) => (
        <span
          key={tag}
          className="ltr-scope inline-flex items-center gap-1 rounded-md bg-ember-500/12 px-2 py-0.5 font-mono text-xs text-ember-300"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="text-ember-400/70 hover:text-ember-300"
            aria-label={`إزالة ${tag}`}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        placeholder={tags.length === 0 ? "أضف تاج واضغط Enter…" : ""}
        className="ltr-scope min-w-[6rem] flex-1 bg-transparent py-0.5 text-xs text-mist-100 outline-none placeholder:text-mist-500"
      />
    </div>
  );
}

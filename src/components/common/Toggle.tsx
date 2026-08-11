interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  activeColor?: "jade" | "ember";
}

export function Toggle({ checked, onChange, label, activeColor = "jade" }: ToggleProps) {
  const activeClasses = activeColor === "jade" ? "bg-jade-500" : "bg-ember-500";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2"
    >
      <span
        className={`flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors duration-150 ${
          checked ? `${activeClasses} justify-end` : "bg-ink-600 justify-start"
        }`}
      >
        <span className="h-4 w-4 rounded-full bg-white shadow transition-transform duration-150" />
      </span>
      {label && <span className="text-sm text-mist-200">{label}</span>}
    </button>
  );
}

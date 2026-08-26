interface SelectableOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface SelectableGridProps {
  options: SelectableOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

/**
 * A grid of toggleable option buttons, used for both multi-select (asset /
 * content-type questions) and single-select (investor type) onboarding
 * questions -- the caller decides what "toggle" means for its own state.
 *
 * Real `<button>` elements (keyboard-accessible by default) and
 * `aria-pressed` communicate selection state; a checkmark is included so
 * selection is never conveyed by color alone.
 */
export function SelectableGrid({ options, selectedIds, onToggle }: SelectableGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(option.id)}
            className={`flex flex-col items-center gap-0.5 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
              isSelected
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
            }`}
          >
            <span>
              {isSelected ? "✓ " : ""}
              {option.label}
            </span>
            {option.sublabel && <span className="text-xs opacity-70">{option.sublabel}</span>}
          </button>
        );
      })}
    </div>
  );
}

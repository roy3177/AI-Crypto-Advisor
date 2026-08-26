import { Check } from "lucide-react";

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
 * A row of toggleable chip buttons, used for both multi-select (asset /
 * content-type questions) and single-select (investor type) onboarding
 * questions -- the caller decides what "toggle" means for its own state.
 *
 * Real `<button>` elements (keyboard-accessible by default) and
 * `aria-pressed` communicate selection state; a checkmark icon is
 * included so selection is never conveyed by color alone.
 */
export function SelectableGrid({ options, selectedIds, onToggle }: SelectableGridProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(option.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.97] ${
              isSelected
                ? "border-accent bg-accent-soft text-accent"
                : "border-surface-border bg-surface text-foreground hover:border-accent/40 hover:bg-accent-soft/40"
            }`}
          >
            <span>
              {option.label}
              {option.sublabel && <span className="text-muted"> ({option.sublabel})</span>}
            </span>
            {isSelected && <Check className="h-3.5 w-3.5" />}
          </button>
        );
      })}
    </div>
  );
}

/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: Shared labeled input used by the login/signup forms.
 */

import { inputClassName } from "@/components/ui/styles";

interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}

/** Shared label+input used by the signup and login forms, so field styling
 * and behavior only need to be defined once. */
export function FormField({ label, type = "text", value, onChange, required, minLength, autoComplete }: FormFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-base font-semibold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className={inputClassName}
      />
    </label>
  );
}

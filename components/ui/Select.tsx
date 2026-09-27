import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { inputClasses } from "./Input";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select({ className, options, placeholder, ...props }, ref) {
  // With only a disabled placeholder the browser falls back to the first enabled option; start on the placeholder instead.
  const placeholderDefault =
    placeholder !== undefined && props.value === undefined && props.defaultValue === undefined ? "" : undefined;

  return (
    <div className="relative">
      <select ref={ref} className={cn(inputClasses, "appearance-none pr-10", className)} defaultValue={placeholderDefault} {...props}>
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
    </div>
  );
});

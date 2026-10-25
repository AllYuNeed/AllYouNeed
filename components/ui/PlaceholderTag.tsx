/** A small visible "Placeholder" label for details that are not real yet (contact details, figures, quotes). */
export function PlaceholderTag({ className }: { className?: string }) {
  return (
    <span
      className={`ml-2 inline-block rounded-full bg-accent/20 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-[#854F0B] dark:text-accent ${className ?? ""}`}
    >
      Placeholder
    </span>
  );
}

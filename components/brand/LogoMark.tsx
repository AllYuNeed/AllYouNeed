import { cn } from "@/lib/cn";

type Props = { size?: number; className?: string; title?: string };

export function LogoMark({ size = 32, className, title = "Allyouneed" }: Props) {
  return (
    <svg
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    >
      {title ? <title>{title}</title> : null}
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#534AB7" />
      <rect x="26" y="2" width="20" height="20" rx="6" fill="#7F77DD" />
      <rect x="2" y="26" width="20" height="20" rx="6" fill="#7F77DD" />
      <rect x="26" y="26" width="20" height="20" rx="10" fill="#EF9F27" />
    </svg>
  );
}

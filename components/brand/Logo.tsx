import Link from "next/link";
import { cn } from "@/lib/cn";
import { LogoMark } from "./LogoMark";

type Props = { href?: string; className?: string; markSize?: number; onClick?: () => void };

export function Logo({ href, className, markSize = 32, onClick }: Props) {
  const content = (
    <>
      <LogoMark size={markSize} title="" />
      <span className="font-display text-xl font-bold tracking-tight text-text">
        allyou<span className="text-[#7F77DD]">need</span>
      </span>
    </>
  );
  const classes = cn("inline-flex items-center gap-2.5", className);

  if (href !== undefined) {
    return (
      <Link href={href} aria-label="Allyouneed home" className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }
  return <span className={classes}>{content}</span>;
}

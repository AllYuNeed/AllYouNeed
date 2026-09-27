import { cn } from "@/lib/cn";
import { Badge } from "./Badge";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({ eyebrow, title, lead, align = "center", as: Tag = "h2", className }: Props) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {eyebrow ? (
        <Badge tone="primary" className="mb-4">
          {eyebrow}
        </Badge>
      ) : null}
      <Tag className={cn("font-display font-bold tracking-tight text-text", Tag === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl lg:text-5xl")}>
        {title}
      </Tag>
      {lead ? <p className="mt-4 text-lg text-text-muted sm:text-xl">{lead}</p> : null}
    </div>
  );
}

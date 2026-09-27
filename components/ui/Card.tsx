import { cn } from "@/lib/cn";

type Props = {
  hover?: boolean;
  className?: string;
  as?: "div" | "article" | "li";
  children: React.ReactNode;
};

export function Card({ hover, className, as: Tag = "div", children }: Props) {
  return (
    <Tag
      className={cn(
        "relative rounded-2xl border border-border bg-background p-6 shadow-soft",
        hover && "transition-[translate,scale,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift",
        className
      )}
    >
      {children}
    </Tag>
  );
}

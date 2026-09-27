import { cn } from "@/lib/cn";

type Props = {
  id?: string;
  tone?: "default" | "surface";
  className?: string;
  children: React.ReactNode;
};

export function Section({ id, tone = "default", className, children }: Props) {
  return (
    <section
      id={id}
      className={cn("relative py-20 sm:py-28", tone === "surface" && "bg-surface", className)}
    >
      {children}
    </section>
  );
}

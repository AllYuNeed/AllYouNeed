import { cn } from "@/lib/cn";

export function PhoneFrame({ tone, className, children }: { tone: "light" | "dark"; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative w-[260px] rounded-[2.4rem] border-[6px] border-[#1a1f3a] bg-[#1a1f3a] shadow-lift", className)}>
      <div className={cn("relative overflow-hidden rounded-[2rem]", tone === "dark" ? "dark bg-[#0B1020] text-[#E7E9F5]" : "bg-white text-[#0F172A]")}>
        <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-[#1a1f3a]" aria-hidden="true" />
        <div className="flex items-center justify-between px-6 pt-3 text-[10px] font-semibold">
          <span aria-hidden="true">9:41</span>
          <span aria-hidden="true">●●● ▲ ▮</span>
        </div>
        <div className="px-4 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}

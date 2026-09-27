import { cn } from "@/lib/cn";

/** Slow-drifting indigo/amber blobs over a faint dot grid. Pure CSS; keyframes disabled under reduced motion in globals.css. */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute inset-0 dot-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute -left-1/4 -top-1/4 h-[70vh] w-[70vw] rounded-full bg-primary/30 blur-3xl animate-aurora" />
      <div className="absolute -right-1/4 top-1/3 h-[60vh] w-[60vw] rounded-full bg-accent/20 blur-3xl animate-aurora [animation-delay:-6s]" />
      <div className="absolute bottom-0 left-1/3 h-[50vh] w-[50vw] rounded-full bg-[#7F77DD]/25 blur-3xl animate-aurora [animation-delay:-12s]" />
    </div>
  );
}

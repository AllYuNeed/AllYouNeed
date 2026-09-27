"use client";

import { m } from "motion/react";
import { ease } from "@/lib/motion";

// MotionConfig reducedMotion="user" (in providers) already drops the y-offset for reduced-motion users.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <m.div data-reveal initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
      {children}
    </m.div>
  );
}

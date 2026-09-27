"use client";

import { ThemeProvider } from "next-themes";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MotionProvider>
        <SmoothScroll>{children}</SmoothScroll>
      </MotionProvider>
    </ThemeProvider>
  );
}

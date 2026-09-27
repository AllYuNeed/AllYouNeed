import { test, expect } from "vitest";
import { duration, ease, spring, stagger, viewport, fadeUp, staggerContainer } from "@/lib/motion";

test("exposes the documented motion tokens", () => {
  expect(duration).toEqual({ fast: 0.15, base: 0.3, slow: 0.6 });
  expect(ease).toEqual([0.22, 1, 0.36, 1]);
  expect(spring).toEqual({ type: "spring", stiffness: 300, damping: 24 });
  expect(stagger.sm).toBe(0.06);
  expect(stagger.md).toBe(0.08);
  expect(viewport).toEqual({ once: true, margin: "-10% 0px" });
});

test("fadeUp animates only opacity and transform", () => {
  expect(Object.keys(fadeUp.hidden).sort()).toEqual(["opacity", "y"]);
  expect(fadeUp.show.transition.duration).toBe(0.6);
});

test("staggerContainer uses the given gap", () => {
  expect(staggerContainer(0.1).show.transition.staggerChildren).toBe(0.1);
  expect(staggerContainer().show.transition.staggerChildren).toBe(0.08);
});

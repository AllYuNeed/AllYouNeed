import { test, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

const root = process.cwd();
const files = (dir: string): string[] =>
  readdirSync(join(root, dir)).flatMap((name) => {
    const rel = join(dir, name);
    return statSync(join(root, rel)).isDirectory() ? files(rel) : /\.tsx?$/.test(name) ? [rel] : [];
  });

// A pointer-state utility that moves, scales, rotates or skews the element, or plays a keyframe animation.
const pointerTransform = /^(?:[\w\[\]:&-]+:)?(?:group-hover|hover|active):(?:-?(?:translate|scale|rotate|skew)(?:-|$)|animate-)/;

test("hover, group-hover and press transforms only apply without a reduced-motion preference", () => {
  const violations: string[] = [];
  for (const file of [...files("components"), ...files("app")]) {
    for (const token of readFileSync(join(root, file), "utf8").split(/[\s"'`{}(),]+/)) {
      if (pointerTransform.test(token) && !token.startsWith("motion-safe:")) violations.push(`${file}: ${token}`);
    }
  }
  expect(violations).toEqual([]);
});

test("the primary Button's lift and shine sweep are motion-safe, while its colours are not gated", () => {
  render(
    <Button arrow>
      Start free
    </Button>
  );
  const button = screen.getByRole("button", { name: "Start free" });
  expect(button.className).toMatch(/(?:^|\s)motion-safe:hover:-translate-y-0\.5(?:\s|$)/);
  expect(button.className).not.toMatch(/(?:^|\s)hover:-translate-y-0\.5(?:\s|$)/);
  expect(button.className).toMatch(/(?:^|\s)hover:shadow-lift(?:\s|$)/);
  const shine = button.querySelector('span[aria-hidden="true"]')!;
  expect(shine.className).toMatch(/(?:^|\s)motion-safe:group-hover:animate-shine(?:\s|$)/);
  expect(shine.className).not.toMatch(/(?:^|\s)group-hover:animate-shine(?:\s|$)/);
});

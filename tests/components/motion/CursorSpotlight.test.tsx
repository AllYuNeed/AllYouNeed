import { test, expect } from "vitest";
import { render } from "@testing-library/react";
import { CursorSpotlight } from "@/components/motion/CursorSpotlight";

test("renders nothing without a fine hover pointer (matchMedia stub reports no hover)", () => {
  const { container } = render(<CursorSpotlight />);
  expect(container).toBeEmptyDOMElement();
});

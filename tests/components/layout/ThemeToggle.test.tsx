import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// A stateful stand-in for next-themes: `theme` is the stored choice, `resolvedTheme` what the page shows.
// The OS reports light.
const store = vi.hoisted(() => {
  let theme = "system";
  const listeners = new Set<() => void>();
  return {
    get: () => theme,
    subscribe: (cb: () => void) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    setTheme: vi.fn((next: string) => {
      theme = next;
      for (const cb of [...listeners]) cb();
    }),
    reset: (value: string) => {
      theme = value;
    },
  };
});

vi.mock("next-themes", async () => {
  const { useSyncExternalStore } = await import("react");
  return {
    useTheme: () => {
      const theme = useSyncExternalStore(store.subscribe, store.get, store.get);
      return { theme, systemTheme: "light", resolvedTheme: theme === "system" ? "light" : theme, setTheme: store.setTheme };
    },
  };
});

import { ThemeToggle } from "@/components/layout/ThemeToggle";

// jsdom implements neither document.startViewTransition nor Element.animate; tests that need them stub them.
type Stubbable = { startViewTransition?: unknown; animate?: unknown };

beforeEach(() => {
  store.reset("system");
  store.setTheme.mockClear();
});

afterEach(() => {
  Reflect.deleteProperty(document, "startViewTransition");
  Reflect.deleteProperty(document.documentElement, "animate");
});

test("switches to dark from light", async () => {
  store.reset("light");
  const user = userEvent.setup();
  render(<ThemeToggle />);
  const btn = await screen.findByRole("button", { name: /switch to dark theme/i });
  await user.click(btn);
  expect(store.setTheme).toHaveBeenCalledWith("dark");
});

test("cycles system, light, dark and back to system, naming the current and next choice", async () => {
  const user = userEvent.setup();
  render(<ThemeToggle />);
  const btn = await screen.findByRole("button", { name: "Theme: system. Switch to light theme" });

  await user.click(btn);
  expect(store.setTheme).toHaveBeenLastCalledWith("light");
  expect(btn).toHaveAccessibleName("Theme: light. Switch to dark theme");

  await user.click(btn);
  expect(store.setTheme).toHaveBeenLastCalledWith("dark");
  expect(btn).toHaveAccessibleName("Theme: dark. Switch to system theme");

  await user.click(btn);
  expect(store.setTheme).toHaveBeenLastCalledWith("system");
  expect(btn).toHaveAccessibleName("Theme: system. Switch to light theme");
});

describe("circular View Transition", () => {
  function stubViewTransition(ready: () => Promise<void>) {
    const start = vi.fn((cb: () => void) => {
      cb();
      return { ready: ready(), finished: Promise.resolve(), updateCallbackDone: Promise.resolve() };
    });
    (document as Stubbable).startViewTransition = start;
    (document.documentElement as Stubbable).animate = vi.fn();
    return start;
  }

  test("runs only when the page's resolved theme actually changes", async () => {
    const start = stubViewTransition(() => Promise.resolve());
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const btn = await screen.findByRole("button", { name: /switch to light theme/i });

    await user.click(btn); // system (OS light) -> light: nothing visible changes
    expect(store.setTheme).toHaveBeenLastCalledWith("light");
    expect(start).not.toHaveBeenCalled();

    await user.click(btn); // light -> dark
    expect(store.setTheme).toHaveBeenLastCalledWith("dark");
    expect(start).toHaveBeenCalledTimes(1);

    await user.click(btn); // dark -> system (OS light)
    expect(store.setTheme).toHaveBeenLastCalledWith("system");
    expect(start).toHaveBeenCalledTimes(2);
  });

  test("a skipped transition (ready rejects) does not surface an unhandled rejection", async () => {
    stubViewTransition(() => Promise.reject(new DOMException("Transition was skipped", "AbortError")));
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    process.on("unhandledRejection", onUnhandled);
    try {
      store.reset("light");
      const user = userEvent.setup();
      render(<ThemeToggle />);
      await user.click(await screen.findByRole("button", { name: /switch to dark theme/i }));
      expect(store.setTheme).toHaveBeenLastCalledWith("dark");
      await new Promise((r) => setTimeout(r, 20));
    } finally {
      process.off("unhandledRejection", onUnhandled);
    }
    expect(unhandled).toEqual([]);
  });
});

import { afterEach, describe, expect, test } from "vitest";
import { act } from "@testing-library/react";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { LoginForm } from "@/components/forms/LoginForm";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { ContactForm } from "@/components/forms/ContactForm";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

// Before hydration (slow network, JS off) the browser owns the form. It must never fall back to the
// default GET, which would put the password and contact details in the URL, history and access logs.
const forms: [string, () => ReactElement][] = [
  ["LoginForm", () => <LoginForm />],
  ["RegisterForm", () => <RegisterForm />],
  ["ContactForm", () => <ContactForm />],
  ["NewsletterForm", () => <NewsletterForm />],
];

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  if (root) act(() => root!.unmount());
  root = null;
  container?.remove();
  container = null;
});

function parse(html: string) {
  const el = document.createElement("div");
  el.innerHTML = html;
  return el;
}

describe.each(forms)("%s server markup", (_name, ui) => {
  test("posts instead of the default GET and keeps the submit button disabled until hydrated", () => {
    const el = parse(renderToString(ui()));
    const form = el.querySelector("form")!;
    expect(form.getAttribute("method")).toBe("post");
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(submit).not.toBeNull();
    expect(submit.hasAttribute("disabled")).toBe(true);
  });

  test("the submit button is enabled once hydrated", async () => {
    container = parse(renderToString(ui()));
    document.body.appendChild(container);
    const recoverable: unknown[] = [];
    await act(async () => {
      root = hydrateRoot(container!, ui(), { onRecoverableError: (error) => recoverable.push(error) });
    });
    expect(recoverable.map(String)).toEqual([]);
    expect(container.querySelector('button[type="submit"]')).toBeEnabled();
  });
});

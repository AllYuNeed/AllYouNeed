import { afterEach, describe, expect, test, vi } from "vitest";
import { act } from "@testing-library/react";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";

// The auth forms read the sign-in state; pin it so server and browser render the same thing. "signed-out" is what a
// configured site shows an anonymous visitor; the reset form needs a session, so it gets "signed-in".
const h = vi.hoisted(() => ({ status: "signed-out" }));
vi.mock("@/lib/auth/useAuth", () => ({ useAuth: () => ({ status: h.status, user: null, recovery: false, signOut: vi.fn() }) }));

import { LoginForm } from "@/components/forms/LoginForm";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { ContactForm } from "@/components/forms/ContactForm";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

// Before hydration (slow network, JS off) the browser owns the form. It must never fall back to the
// default GET, which would put the password and contact details in the URL, history and access logs.
const forms: [string, () => ReactElement, string][] = [
  ["LoginForm", () => <LoginForm />, "signed-out"],
  ["RegisterForm", () => <RegisterForm />, "signed-out"],
  ["ForgotPasswordForm", () => <ForgotPasswordForm />, "signed-out"],
  ["ResetPasswordForm", () => <ResetPasswordForm />, "signed-in"],
  ["ContactForm", () => <ContactForm />, "signed-out"],
  ["NewsletterForm", () => <NewsletterForm />, "signed-out"],
];

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  if (root) act(() => root!.unmount());
  root = null;
  container?.remove();
  container = null;
  h.status = "signed-out";
});

function parse(html: string) {
  const el = document.createElement("div");
  el.innerHTML = html;
  return el;
}

describe.each(forms)("%s server markup", (_name, ui, status) => {
  test("posts instead of the default GET and keeps the submit button disabled until hydrated", () => {
    h.status = status;
    const el = parse(renderToString(ui()));
    const form = el.querySelector("form")!;
    expect(form.getAttribute("method")).toBe("post");
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(submit).not.toBeNull();
    expect(submit.hasAttribute("disabled")).toBe(true);
  });

  test("the submit button is enabled once hydrated", async () => {
    h.status = status;
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

describe("a site with no Supabase settings", () => {
  test.each([
    ["LoginForm", () => <LoginForm />],
    ["RegisterForm", () => <RegisterForm />],
    ["ForgotPasswordForm", () => <ForgotPasswordForm />],
  ] as [string, () => ReactElement][])("%s stays disabled after hydration and says why", async (_name, ui) => {
    h.status = "unconfigured";
    container = parse(renderToString(ui()));
    document.body.appendChild(container);
    await act(async () => {
      root = hydrateRoot(container!, ui());
    });
    expect(container.querySelector('button[type="submit"]')).toBeDisabled();
    expect(container.textContent).toMatch(/accounts aren't switched on/i);
  });
});

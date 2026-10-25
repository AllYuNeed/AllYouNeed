import { test, expect, vi, beforeEach, describe } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fakeSupabase } from "../../helpers/fakeSupabase";

const user = { id: "11111111-1111-1111-1111-111111111111", email: "priya@example.test", email_confirmed_at: "2026-10-25T00:00:00Z" };

const h = vi.hoisted(() => ({
  client: null as unknown,
  auth: { status: "signed-in", user: null, recovery: false, signOut: vi.fn() } as { status: string; user: unknown; recovery: boolean; signOut: ReturnType<typeof vi.fn> },
  replace: vi.fn(),
}));
vi.mock("@/lib/supabase/client", () => ({ getSupabase: () => h.client }));
vi.mock("@/lib/auth/useAuth", () => ({ useAuth: () => h.auth }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: h.replace, push: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/account/",
  useSearchParams: () => new URLSearchParams(),
}));

import { AccountPage } from "@/components/account/AccountPage";

const profile = { full_name: "Priya Nair", company: "Test Co", phone: "9876543210" };
let fake: ReturnType<typeof fakeSupabase>;

beforeEach(() => {
  fake = fakeSupabase({ profiles: { data: profile } });
  h.client = fake;
  h.auth = { status: "signed-in", user, recovery: false, signOut: vi.fn(async () => ({ ok: true })) };
  h.replace.mockClear();
});

describe("AccountPage", () => {
  test("shows the signed-in email and loads the user's own profile row", async () => {
    render(<AccountPage />);
    expect(screen.getByText("priya@example.test")).toBeInTheDocument();
    expect(await screen.findByLabelText(/full name/i)).toHaveValue("Priya Nair");
    expect(screen.getByLabelText(/company/i)).toHaveValue("Test Co");
    expect(screen.getByLabelText(/phone/i)).toHaveValue("9876543210");
    const b = fake.builders.profiles;
    expect(b.select).toHaveBeenCalledWith("full_name, company, phone");
    expect(b.eq).toHaveBeenCalledWith("id", user.id);
  });

  test("saving updates only the three editable columns, for this user's id", async () => {
    const u = userEvent.setup();
    render(<AccountPage />);
    const name = await screen.findByLabelText(/full name/i);
    await u.clear(name);
    await u.type(name, "Priya N.");
    fake.builders.profiles.maybeSingle.mockClear();
    await u.click(screen.getByRole("button", { name: /save details/i }));
    expect(await screen.findByText(/details saved/i)).toBeInTheDocument();
    const b = fake.builders.profiles;
    expect(b.update).toHaveBeenCalledWith({ full_name: "Priya N.", company: "Test Co", phone: "9876543210" });
    expect(b.eq).toHaveBeenCalledWith("id", user.id);
  });

  test("an invalid phone number is rejected before anything is saved", async () => {
    const u = userEvent.setup();
    render(<AccountPage />);
    const phone = await screen.findByLabelText(/phone/i);
    await u.clear(phone);
    await u.type(phone, "12345");
    await u.click(screen.getByRole("button", { name: /save details/i }));
    expect(await screen.findByText(/valid 10-digit/i)).toBeInTheDocument();
    expect(fake.builders.profiles.update).not.toHaveBeenCalled();
  });

  test("a failed save is reported without the database's wording", async () => {
    const u = userEvent.setup();
    render(<AccountPage />);
    await screen.findByLabelText(/full name/i);
    h.client = fakeSupabase({ profiles: { error: { code: "42501", message: "permission denied for table profiles" } } });
    await u.click(screen.getByRole("button", { name: /save details/i }));
    expect(await screen.findByText(/couldn't save your details/i)).toBeInTheDocument();
    expect(screen.queryByText(/permission denied/i)).not.toBeInTheDocument();
  });

  test("a missing profile row is explained instead of looking like an empty form", async () => {
    h.client = fakeSupabase({ profiles: { data: null } });
    render(<AccountPage />);
    expect(await screen.findByText(/couldn't find your profile/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
  });

  test("a load error is reported", async () => {
    h.client = fakeSupabase({ profiles: { error: { code: "500", message: "x" } } });
    render(<AccountPage />);
    expect(await screen.findByText(/couldn't load your details/i)).toBeInTheDocument();
  });

  test("Log out signs out this browser and returns to the home page", async () => {
    const u = userEvent.setup();
    render(<AccountPage />);
    await u.click(await screen.findByRole("button", { name: /log out/i }));
    await waitFor(() => expect(h.replace).toHaveBeenCalledWith("/"));
    expect(h.auth.signOut).toHaveBeenCalledTimes(1);
  });

  test("links to the change-password page", async () => {
    render(<AccountPage />);
    expect(await screen.findByRole("link", { name: /change password/i })).toHaveAttribute("href", "/reset-password/");
  });

  test("a signed-out visitor sees none of it and is sent to log in", async () => {
    h.auth = { ...h.auth, status: "signed-out", user: null };
    render(<AccountPage />);
    expect(screen.queryByText("priya@example.test")).not.toBeInTheDocument();
    await waitFor(() => expect(h.replace).toHaveBeenCalledWith("/login/?next=%2Faccount%2F"));
  });
});

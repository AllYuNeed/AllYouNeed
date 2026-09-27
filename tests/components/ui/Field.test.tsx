import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

test("links label, error and describedby to the control", () => {
  render(
    <Field id="email" label="Work email" error="Enter a valid work email">
      <Input type="email" />
    </Field>
  );
  const input = screen.getByLabelText("Work email");
  expect(input).toHaveAttribute("id", "email");
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAttribute("aria-describedby", "email-error");
  expect(screen.getByText("Enter a valid work email")).toHaveAttribute("id", "email-error");
});

test("no error means aria-invalid false and hint is described", () => {
  render(
    <Field id="phone" label="Phone" hint="10 digits">
      <Input />
    </Field>
  );
  const input = screen.getByLabelText("Phone");
  expect(input).toHaveAttribute("aria-invalid", "false");
  expect(input).toHaveAttribute("aria-describedby", "phone-hint");
});

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { signup } from "@/lib/forms/actions";
import { initialFormState } from "@/lib/forms/types";
import { PASSWORD_MIN_LENGTH } from "@/lib/forms/validation";
import { buttonClass } from "@/components/ui/button";
import { CheckboxField, FormAlert, PasswordField, TextField } from "./fields";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialFormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} noValidate className="space-y-5">
      <TextField
        label="Full name"
        name="name"
        autoComplete="name"
        placeholder="Your name"
        required
        maxLength={100}
        defaultValue={state.values?.name}
        error={errors.name}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="name@example.com"
        required
        defaultValue={state.values?.email}
        error={errors.email}
      />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="new-password"
        required
        minLength={PASSWORD_MIN_LENGTH}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters, including a letter and a number.`}
        error={errors.password}
      />
      <PasswordField
        label="Confirm password"
        name="confirmPassword"
        autoComplete="new-password"
        required
        error={errors.confirmPassword}
      />
      <CheckboxField name="terms" required error={errors.terms}>
        I agree to the{" "}
        <Link href="/terms" className="text-accent hover:underline">
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-accent hover:underline">
          Privacy Policy
        </Link>
        .
      </CheckboxField>

      <FormAlert status={state.status} message={state.message} />

      <button type="submit" className={buttonClass("primary", "md", "w-full")} disabled={pending}>
        {pending && <LoaderCircle className="size-5 animate-spin" aria-hidden />}
        {pending ? "Creating account…" : "Sign Up"}
      </button>
    </form>
  );
}

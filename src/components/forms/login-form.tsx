"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { login } from "@/lib/forms/actions";
import { initialFormState } from "@/lib/forms/types";
import { buttonClass } from "@/components/ui/button";
import { CheckboxField, FormAlert, PasswordField, TextField } from "./fields";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialFormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} noValidate className="space-y-5">
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
      <PasswordField label="Password" name="password" autoComplete="current-password" required error={errors.password} />
      <CheckboxField name="remember">Keep me signed in</CheckboxField>

      <FormAlert status={state.status} message={state.message} />

      <button type="submit" className={buttonClass("primary", "md", "w-full")} disabled={pending}>
        {pending && <LoaderCircle className="size-5 animate-spin" aria-hidden />}
        {pending ? "Signing in…" : "Login"}
      </button>
    </form>
  );
}

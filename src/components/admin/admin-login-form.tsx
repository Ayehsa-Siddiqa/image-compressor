"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { loginAdmin } from "@/lib/admin/actions";
import { initialFormState } from "@/lib/forms/types";
import { buttonClass } from "@/components/ui/button";
import { FormAlert, PasswordField, TextField } from "@/components/forms/fields";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialFormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} noValidate className="space-y-5">
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        inputMode="email"
        required
        defaultValue={state.values?.email}
        error={errors.email}
      />
      <PasswordField label="Password" name="password" autoComplete="current-password" required error={errors.password} />
      <FormAlert status={state.status} message={state.message} />
      <button type="submit" className={buttonClass("primary", "md", "w-full")} disabled={pending}>
        {pending && <LoaderCircle className="size-5 animate-spin" aria-hidden />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

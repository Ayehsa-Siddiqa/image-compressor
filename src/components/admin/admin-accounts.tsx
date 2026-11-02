"use client";

import { useActionState, useState, useTransition } from "react";
import { LoaderCircle, Trash2, UserPlus } from "lucide-react";
import { createAdminAccount, deleteAdminAccount } from "@/lib/admin/actions";
import { initialFormState } from "@/lib/forms/types";
import { FormAlert, PasswordField, TextField } from "@/components/forms/fields";
import { buttonClass } from "@/components/ui/button";
import { smallButton } from "./post-actions";

export function AddAdminForm() {
  const [state, formAction, pending] = useActionState(createAdminAccount, initialFormState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={formAction} noValidate className="space-y-4">
      <TextField label="Name" name="name" autoComplete="off" required defaultValue={state.values?.name} error={errors.name} />
      <TextField label="Email" name="email" type="email" autoComplete="off" required defaultValue={state.values?.email} error={errors.email} />
      <PasswordField label="Password" name="password" autoComplete="new-password" required error={errors.password} />
      <FormAlert status={state.status} message={state.message} />
      <button type="submit" className={buttonClass("primary", "md", "w-full")} disabled={pending}>
        {pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <UserPlus className="size-5" aria-hidden />}
        Add admin
      </button>
    </form>
  );
}

export function RemoveAdminButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        className={`${smallButton} text-danger hover:border-danger`}
        disabled={pending}
        onClick={() => {
          if (!confirm(`Remove ${name}? They'll be signed out and can't sign in again.`)) return;
          startTransition(async () => {
            setError((await deleteAdminAccount(id)).error);
          });
        }}
      >
        {pending ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> : <Trash2 className="size-3.5" aria-hidden />}
        Remove
      </button>
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

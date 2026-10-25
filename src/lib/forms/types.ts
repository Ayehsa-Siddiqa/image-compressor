/** State returned by every form server action and read by the form with `useActionState`. */
export interface FormState<Field extends string = string> {
  status: "idle" | "success" | "error";
  /** Message shown above the submit button. */
  message?: string;
  /** Per-field validation errors, keyed by input `name`. */
  fieldErrors?: Partial<Record<Field, string>>;
  /** Submitted values (never passwords) so the form can be refilled after a failed submit. */
  values?: Partial<Record<Field, string>>;
}

export const initialFormState: FormState = { status: "idle" };

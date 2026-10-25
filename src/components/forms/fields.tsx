"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

const control =
  "block w-full rounded-[10px] border bg-card px-4 text-base text-ink-2 placeholder:text-faint transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(37_99_235/0.15)] focus:outline-none disabled:opacity-60";

const borderFor = (error?: string) => (error ? "border-danger" : "border-line-strong");

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  children: ReactNode;
}

function FieldShell({ id, label, error, hint, optional, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink-2 sm:mb-2 sm:text-[15px]">
        {label}
        {optional && <span className="ml-1 font-normal text-faint">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-faint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: ReactNode) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: ReactNode; optional?: boolean };

export function TextField({ label, error, hint, optional, className = "", ...props }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${control} ${borderFor(error)} h-11 sm:h-12 ${className}`}
        {...props}
      />
    </FieldShell>
  );
}

export function PasswordField({ label, error, hint, className = "", ...props }: TextFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`${control} ${borderFor(error)} h-11 pr-12 sm:h-12 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-faint transition-colors hover:bg-surface hover:text-ink-2"
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
    </FieldShell>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: ReactNode };

export function TextAreaField({ label, error, hint, className = "", ...props }: TextAreaFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${control} ${borderFor(error)} min-h-[160px] resize-y py-3 ${className}`}
        {...props}
      />
    </FieldShell>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; options: readonly string[]; placeholder: string };

export function SelectField({ label, error, options, placeholder, className = "", ...props }: SelectFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error)}
        className={`${control} ${borderFor(error)} h-11 appearance-none sm:h-12 bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='20'%20height='20'%20fill='none'%20stroke='%23888'%20stroke-width='2'%20viewBox='0%200%2024%2024'%3E%3Cpath%20d='m6%209%206%206%206-6'/%3E%3C/svg%3E")] bg-[length:20px] bg-[position:right_14px_center] bg-no-repeat pr-11 ${className}`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

type CheckboxFieldProps = InputHTMLAttributes<HTMLInputElement> & { children: ReactNode; error?: string };

export function CheckboxField({ children, error, ...props }: CheckboxFieldProps) {
  const id = useId();
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-[18px] shrink-0 cursor-pointer rounded accent-primary"
          {...props}
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-snug text-body sm:text-[15px]">
          {children}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

/** Success / error banner for a whole form, announced to screen readers. */
export function FormAlert({ status, message }: { status: "idle" | "success" | "error"; message?: string }) {
  if (!message || status === "idle") return null;
  const success = status === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-[15px] ${
        success
          ? "border-success-line bg-success-soft text-success"
          : "border-[#f5c2c0] bg-[#fdf2f2] text-[#9b2c28] dark:border-[#5c2422] dark:bg-[#2a1314] dark:text-[#f3a9a5]"
      }`}
    >
      <Icon className="mt-0.5 size-[18px] shrink-0" aria-hidden />
      <p>{message}</p>
    </div>
  );
}

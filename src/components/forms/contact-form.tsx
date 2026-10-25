"use client";

import { useActionState } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { sendContactMessage } from "@/lib/forms/actions";
import { initialFormState } from "@/lib/forms/types";
import { CONTACT_TOPICS, MESSAGE_MAX_LENGTH } from "@/lib/forms/validation";
import { buttonClass } from "@/components/ui/button";
import { FormAlert, SelectField, TextAreaField, TextField } from "./fields";

export function ContactForm({ id }: { id?: string }) {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialFormState);
  const errors = state.fieldErrors ?? {};
  // After a successful send the fields are cleared; after an error they keep what was typed.
  const values = state.status === "success" ? {} : (state.values ?? {});

  return (
    <section
      id={id}
      aria-labelledby="contact-form-title"
      className="scroll-mt-6 rounded-3xl border border-line bg-card px-5 py-8 shadow-card sm:px-10 sm:py-9"
    >
      <h2 id="contact-form-title" className="font-display text-[22px] font-semibold text-ink sm:text-[26px] md:text-[28px]">
        Send us a message
      </h2>
      <p className="mt-2 text-[15px] text-subtle sm:text-base">Questions, ideas or problems — we read every message.</p>

      <form action={formAction} noValidate className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            required
            maxLength={100}
            defaultValue={values.name}
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
            defaultValue={values.email}
            error={errors.email}
          />
        </div>
        {/* key resets the uncontrolled select when the submitted value changes */}
        <SelectField
          key={values.topic ?? "empty"}
          label="Topic"
          name="topic"
          required
          placeholder="Choose a topic"
          options={CONTACT_TOPICS}
          defaultValue={values.topic ?? ""}
          error={errors.topic}
        />
        <TextAreaField
          label="Message"
          name="message"
          placeholder="How can we help?"
          required
          maxLength={MESSAGE_MAX_LENGTH}
          rows={6}
          defaultValue={values.message}
          error={errors.message}
        />

        <FormAlert status={state.status} message={state.message} />

        <button type="submit" className={buttonClass("primary", "md")} disabled={pending}>
          {pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Send className="size-5" aria-hidden />}
          {pending ? "Sending…" : "Send Message"}
        </button>
      </form>
    </section>
  );
}

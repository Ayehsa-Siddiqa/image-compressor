"use server";

import type { FormState } from "./types";
import {
  CONTACT_TOPICS,
  MESSAGE_MAX_LENGTH,
  text,
  validateEmail,
  validateName,
  validateNewPassword,
} from "./validation";

/*
 * Form server actions for Login, Sign Up and Contact.
 *
 * Each action validates the submission on the server, then reaches a clearly marked
 * "CONNECT YOUR BACKEND HERE" point. Until a database / auth provider is connected there,
 * the action tells the visitor honestly that the feature isn't available yet — it never
 * pretends a message was sent or an account was created.
 */

type LoginField = "email" | "password";
type SignupField = "name" | "email" | "password" | "confirmPassword" | "terms";
type ContactField = "name" | "email" | "topic" | "message";

function notConnected<F extends string>(what: string, values?: FormState<F>["values"]): FormState<F> {
  return {
    status: "error",
    message: `${what} isn't available yet — we're still setting it up. Please try again soon.`,
    values,
  };
}

function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

export async function login(_prev: FormState<LoginField>, formData: FormData): Promise<FormState<LoginField>> {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  const fieldErrors = {
    email: validateEmail(email),
    password: password ? undefined : "Enter your password.",
  };
  if (hasErrors(fieldErrors)) return { status: "error", fieldErrors, values: { email } };

  // CONNECT YOUR BACKEND HERE: verify the credentials with your database / auth provider,
  // create a session (use `remember` to choose its lifetime), then `redirect("/")` from "next/navigation".
  // Return a generic "Incorrect email or password." on failure so you don't reveal which accounts exist.
  void remember;
  return notConnected("Signing in", { email });
}

export async function signup(_prev: FormState<SignupField>, formData: FormData): Promise<FormState<SignupField>> {
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const terms = formData.get("terms") === "on";

  const fieldErrors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validateNewPassword(password),
    confirmPassword: !confirmPassword
      ? "Confirm your password."
      : confirmPassword !== password
        ? "Passwords don't match."
        : undefined,
    terms: terms ? undefined : "Please accept the Terms of Use and Privacy Policy.",
  };
  const values = { name, email };
  if (hasErrors(fieldErrors)) return { status: "error", fieldErrors, values };

  // CONNECT YOUR BACKEND HERE: check the email isn't already registered, hash the password
  // (e.g. bcrypt/argon2 — never store it as plain text), save the user, start a session,
  // then `redirect("/")` from "next/navigation".
  return notConnected("Creating an account", values);
}

export async function sendContactMessage(
  _prev: FormState<ContactField>,
  formData: FormData,
): Promise<FormState<ContactField>> {
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const topic = text(formData, "topic");
  const message = text(formData, "message");

  const fieldErrors = {
    name: validateName(name),
    email: validateEmail(email),
    topic: (CONTACT_TOPICS as readonly string[]).includes(topic) ? undefined : "Choose a topic.",
    message: !message
      ? "Write your message."
      : message.length < 10
        ? "Please add a little more detail (at least 10 characters)."
        : message.length > MESSAGE_MAX_LENGTH
          ? `Keep your message under ${MESSAGE_MAX_LENGTH} characters.`
          : undefined,
  };
  const values = { name, email, topic, message };
  if (hasErrors(fieldErrors)) return { status: "error", fieldErrors, values };

  // CONNECT YOUR BACKEND HERE: save { name, email, topic, message } to your database (or send it by
  // email), then return:
  //   { status: "success", message: "Thanks! Your message has been sent. We'll get back to you soon." }
  return notConnected("Sending messages", values);
}

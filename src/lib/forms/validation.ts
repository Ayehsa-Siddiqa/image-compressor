// Shared, dependency-free validation used by the server actions (the browser also checks the basics via
// input attributes, but the server must never trust that).

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PASSWORD_MIN_LENGTH = 8;
export const MESSAGE_MAX_LENGTH = 5000;

export const CONTACT_TOPICS = [
  "General question",
  "Feedback or suggestion",
  "Report a problem",
  "Business enquiry",
] as const;

export function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function validateEmail(email: string): string | undefined {
  if (!email) return "Enter your email address.";
  if (email.length > 254 || !EMAIL.test(email)) return "Enter a valid email address, like name@example.com.";
}

export function validateName(name: string): string | undefined {
  if (!name) return "Enter your name.";
  if (name.length > 100) return "Name must be 100 characters or fewer.";
}

export function validateNewPassword(password: string): string | undefined {
  if (!password) return "Create a password.";
  if (password.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (password.length > 128) return "Use 128 characters or fewer.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Include at least one letter and one number.";
}

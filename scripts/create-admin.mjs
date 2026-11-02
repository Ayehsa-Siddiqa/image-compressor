// Creates (or resets the password of) a dashboard admin. Used for the very first admin; after that,
// admins can add each other at /dashboard/admins.
//
//   npm run admin:create -- you@example.com "Your Name"
//
// Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local and asks for the password.
import { randomBytes, scrypt } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { createClient } from "@supabase/supabase-js";

const [email, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(" ").trim();
if (!email || !email.includes("@") || !name) {
  console.error('Usage: npm run admin:create -- you@example.com "Your Name"');
  process.exit(1);
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await rl.question("Password (at least 8 characters): ");
rl.close();
if (password.length < 8) {
  console.error("The password must be at least 8 characters.");
  process.exit(1);
}

// Same format as src/lib/admin/password.ts: scrypt$N$r$p$salt$hash
const N = 16384, R = 8, P = 1;
const salt = randomBytes(16);
const hash = await new Promise((resolve, reject) =>
  scrypt(password, salt, 64, { N, r: R, p: P, maxmem: 256 * N * R }, (error, key) => (error ? reject(error) : resolve(key))),
);
const passwordHash = ["scrypt", N, R, P, salt.toString("base64"), hash.toString("base64")].join("$");

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { error } = await db
  .from("admin_users")
  .upsert({ email: email.toLowerCase(), name, password_hash: passwordHash }, { onConflict: "email" });
if (error) {
  console.error(`Couldn't save the admin: ${error.message}`);
  process.exit(1);
}
console.log(`Done. ${email} can now sign in at /dashboard.`);

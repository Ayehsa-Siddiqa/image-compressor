import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

const COOKIE = "toolve_admin";
const SESSION_DAYS = 7;

export interface Admin {
  id: string;
  email: string;
  name: string;
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(adminId: string) {
  const db = getSupabase();
  if (!db) throw new Error("Database not configured");
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const { error } = await db.from("admin_sessions").insert({ id: hashToken(token), admin_id: adminId, expires_at: expires.toISOString() });
  if (error) throw new Error(`Couldn't create session: ${error.message}`);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // Only sent to the dashboard (its pages and server actions all live under /dashboard).
    path: "/dashboard",
    expires,
  });
}

/** The signed-in admin for this request, or null. */
export const getCurrentAdmin = cache(async (): Promise<Admin | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  const db = getSupabase();
  if (!token || !db) return null;
  const { data } = await db
    .from("admin_sessions")
    .select("expires_at, admin:admin_users(id, email, name)")
    .eq("id", hashToken(token))
    .maybeSingle<{ expires_at: string; admin: Admin | null }>();
  if (!data?.admin || new Date(data.expires_at) <= new Date()) return null;
  return data.admin;
});

/** Returns the signed-in admin, or sends the visitor to the login page. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/dashboard/login");
  return admin;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await getSupabase()?.from("admin_sessions").delete().eq("id", hashToken(token));
  store.delete({ name: COOKIE, path: "/dashboard" });
}

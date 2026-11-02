import type { Metadata } from "next";
import { AuthCard } from "@/components/forms/auth-card";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { isDatabaseConfigured } from "@/lib/supabase";

export const metadata: Metadata = { title: "Sign in" };

export default function AdminLoginPage() {
  return (
    <AuthCard
      title="Admin sign in"
      subtitle="Manage the blog."
      footer={
        isDatabaseConfigured()
          ? "Need an account? Ask an existing admin to add you."
          : "Set up the database first: see “Admin dashboard” in the README."
      }
    >
      <AdminLoginForm />
    </AuthCard>
  );
}

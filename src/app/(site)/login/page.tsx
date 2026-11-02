import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/forms/auth-card";
import { LoginForm } from "@/components/forms/login-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Login",
  description: `Sign in to your ${siteConfig.name} account.`,
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle={`Log in to your ${siteConfig.name} account.`}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-accent hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}

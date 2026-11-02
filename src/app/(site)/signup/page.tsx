import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/forms/auth-card";
import { SignupForm } from "@/components/forms/signup-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Sign Up",
  description: `Create your free ${siteConfig.name} account.`,
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle={`It's free. The compressor works without an account too.`}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}

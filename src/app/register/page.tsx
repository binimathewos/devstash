import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account — DevStash",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Start stashing your dev knowledge"
    >
      <RegisterForm />
    </AuthCard>
  );
}

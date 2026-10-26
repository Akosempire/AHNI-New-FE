"use client";

import React from "react";
import FormButton from "@/components/FormButton";
import FormInput from "@/components/FormInput";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SubmitHandler, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import AuthLayout, { AuthLink } from "@/components/app/AuthLayout";
import { LoginSchema, TLoginFormValues } from "@/features/auth/types/auth";
import { useLogin } from "../../controllers/authController";

export default function LoginForm() {
  const form = useForm<TLoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  const router = useRouter();

  const { login, isLoading, isSuccess } = useLogin();

  const { handleSubmit } = form;

  const onSubmit: SubmitHandler<TLoginFormValues> = async (data) => {
    await login(data);
  };

  // Handle successful login
  React.useEffect(() => {
    if (isSuccess) {
      router.push("/dashboard");
    }
  }, [isSuccess, router]);
  return (
    <AuthLayout
      title="Sign in to your workspace"
      subtitle="Use your AHNi email address and password."
      footer={
        <div className="space-y-3">
          <p>
            Not staff? Sign in to the <AuthLink href="/vendor-portal/login">Vendor portal</AuthLink> or the{" "}
            <AuthLink href="/consultant-portal">Consultant portal</AuthLink>.
          </p>
          <p>
            Trouble signing in? <AuthLink href="mailto:support@ahnigeria.org">Contact IT support</AuthLink>
          </p>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormInput label="Email address" placeholder="name@ahnigeria.org" required type="email" name="email" autoComplete="username" />
          <div>
            <FormInput label="Password" placeholder="Enter your password" required type="password" name="password" autoComplete="current-password" />
            <div className="mt-2 text-right">
              <Link href="/auth/forgot-password" className="text-[14px] font-semibold text-[var(--brand-ink)] hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
          <FormButton loading={isLoading} className="h-12 w-full rounded-xl bg-[var(--ink)] text-[15px] font-bold text-[var(--surface)] hover:bg-black" size="lg">
            Sign in
          </FormButton>
        </form>
      </Form>
    </AuthLayout>
  );
}

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
      title="Welcome back"
      subtitle="Sign in with your AHNi email address."
      audience="staff"
      showPortalSwitch
      footer={
        <p>
          Trouble signing in? <AuthLink href="mailto:support@ahnigeria.org">Contact IT support</AuthLink>
        </p>
      }
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormInput label="Email address" placeholder="name@ahnigeria.org" required type="email" name="email" autoComplete="username" />
          <div className="relative">
            <Link
              href="/auth/forgot-password"
              className="absolute right-0 top-0 text-[13px] text-[var(--muted)] underline decoration-[var(--line-strong)] underline-offset-4 hover:text-[var(--ink)]"
            >
              Forgot password?
            </Link>
            <FormInput label="Password" placeholder="Enter your password" required type="password" name="password" autoComplete="current-password" />
          </div>
          <FormButton loading={isLoading} className="h-10 w-full" size="lg">
            Sign in
          </FormButton>
        </form>
      </Form>
    </AuthLayout>
  );
}

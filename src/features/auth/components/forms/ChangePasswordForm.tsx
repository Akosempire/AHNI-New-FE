"use client";

import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
import FormInput from "@/components/FormInput";
import FormButton from "@/components/FormButton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AuthLayout, { AuthLink } from "@/components/app/AuthLayout";
import PasswordHint from "../PasswordHint";
import useQuery from "@/hooks/useQuery";
import {
  ChangePasswordSchema,
  TChangePasswordFormValues,
} from "@/features/auth/types/auth";
import { useChangePassword } from "../../controllers/authController";

const ChangePasswordForm = () => {
  const form = useForm<TChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  const query = useQuery();

  const router = useRouter();

  const { changePassword, isLoading } = useChangePassword();

  const onSubmit = async ({
    new_password,
    confirm_password,
  }: TChangePasswordFormValues) => {
    const email = query?.get("email") ?? null;
    const token = JSON.parse(localStorage.getItem("authToken") || "{}");

    const payload = {
      email,
      otp: token,
      new_password,
      confirm_password,
    };

    await changePassword(payload);
    localStorage.removeItem("authToken");
    router.push("/auth/login");
  };

  return (
    <AuthLayout
      step="Step 3 of 3"
      title="Choose a new password"
      subtitle="You'll use it to sign in from now on."
      footer={
        <p>
          Changed your mind? <AuthLink href="/auth/login">Back to sign in</AuthLink>
        </p>
      }
    >
      <Form {...form}>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormInput label="New password" type="password" name="new_password" placeholder="Enter a new password" autoComplete="new-password" />
          <FormInput label="Confirm new password" type="password" name="confirm_password" placeholder="Type it again" autoComplete="new-password" />
          <PasswordHint password={form.watch("new_password")} />
          <FormButton loading={isLoading} className="h-12 w-full rounded-xl bg-[var(--ink)] text-[15px] font-bold text-[var(--surface)] hover:bg-black" size="lg" type="submit">
            Update password
          </FormButton>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default ChangePasswordForm;
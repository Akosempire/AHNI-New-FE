"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import FormButton from "@/components/FormButton";
import FormInput from "@/components/FormInput";
import { Eye, EyeOff, Building2, Mail, Lock, AlertCircle, Home } from "lucide-react";
import { useVendorLogin, VendorAuthUtils } from "@/features/vendor-portal/controllers/vendorAuthController";
import { LoadingSpinner } from "@/components/Loading";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

import AuthLayout, { AuthLink } from "@/components/app/AuthLayout";

export default function VendorLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (VendorAuthUtils.isVendorAuthenticated()) {
      setIsRedirecting(true);
      // Add a small delay to allow user to see the login page and potentially clear session
      const timer = setTimeout(() => {
        router.push('/vendor-portal/dashboard');
      }, 3000); // 3 second delay

      return () => clearTimeout(timer);
    }
  }, [router]);

  const handleClearSession = () => {
    VendorAuthUtils.removeVendorToken();
    localStorage.removeItem('vendor_user');
    setIsRedirecting(false);
    setLoginError(null);
    window.location.reload(); // Reload to reset the state
  };

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: login, isPending } = useVendorLogin();

  const onSubmit = (data: LoginFormData) => {
    setLoginError(null);

    login(data, {
      onSuccess: () => {
        console.log('🎯 Frontend: Login successful, initiating redirect...');
        // Force immediate redirect to vendor dashboard
        setTimeout(() => {
          console.log('🚀 Frontend: Executing redirect to vendor dashboard');
          router.push('/vendor-portal/dashboard');
        }, 100); // Small delay to ensure token storage completes
      },
      onError: (error: any) => {
        console.error('❌ Frontend: Login error occurred:', error);
        const errorMessage = error?.response?.data?.message ||
                           error?.response?.data?.error ||
                           error?.message ||
                           "Login failed. Please check your credentials.";
        setLoginError(errorMessage);
      },
    });
  };

  return (
    <AuthLayout
      title="Vendor sign in"
      subtitle="Track your bids, purchase orders and payments."
      audience="vendor"
      showPortalSwitch
      footer={
        <div className="space-y-2">
          <p>
            New supplier? <AuthLink href="/eoi">Register through an expression of interest</AuthLink>
          </p>
          <p>
            Need help? <AuthLink href="mailto:procurement@ahni.org">Contact procurement</AuthLink>
          </p>
        </div>
      }
    >
      {isRedirecting && (
        <div role="status" className="mb-5 flex items-center justify-between gap-3 rounded-[8px] border border-[var(--line-strong)] p-3 text-[13.5px]">
          <span>You&apos;re already signed in. Opening your dashboard…</span>
          <button type="button" onClick={handleClearSession} className="btn btn-outline !h-8 text-[13px]">
            Sign out
          </button>
        </div>
      )}
      {loginError && (
        <p role="alert" className="mb-5 rounded-[8px] border border-[color-mix(in_srgb,var(--danger)_25%,transparent)] bg-[var(--danger-soft)] p-3 text-[13.5px] text-[var(--danger)]">
          {loginError}
        </p>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormInput label="Email address" placeholder="you@company.com" required type="email" name="email" autoComplete="username" />
          <div className="relative">
            <a
              href="mailto:procurement@ahni.org?subject=Vendor%20portal%20password%20reset"
              className="absolute right-0 top-0 text-[13px] text-[var(--muted)] underline decoration-[var(--line-strong)] underline-offset-4 hover:text-[var(--ink)]"
            >
              Forgot password?
            </a>
            <FormInput label="Password" placeholder="Enter your password" required type="password" name="password" autoComplete="current-password" />
          </div>
          <FormButton loading={isPending} className="h-10 w-full" size="lg">
            Sign in
          </FormButton>
        </form>
      </Form>
    </AuthLayout>
  );
}

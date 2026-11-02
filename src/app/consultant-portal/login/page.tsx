"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import FormButton from "@/components/FormButton";
import Card from "@/components/Card";
import { Home, AlertCircle } from "lucide-react";
import { useConsultantLogin, ConsultantAuthUtils } from "@/features/consultant-portal/controllers/consultantAuthController";

import AuthLayout, { AuthLink } from "@/components/app/AuthLayout";

export default function ConsultantLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (ConsultantAuthUtils.isConsultantAuthenticated()) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        router.push('/consultant-portal/dashboard');
      }, 3000); // 3 second delay

      return () => clearTimeout(timer);
    }
  }, [router]);

  const handleClearSession = () => {
    ConsultantAuthUtils.removeConsultantToken();
    setIsRedirecting(false);
    setLoginError(null);
    window.location.reload(); // Reload to reset the state
  };

  const { mutate: login, isPending } = useConsultantLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email || !password) {
      setLoginError("Email and password are required");
      return;
    }

    login({ email, password }, {
      onSuccess: () => {
        console.log('🎯 Frontend: Consultant login successful, initiating redirect...');
        setTimeout(() => {
          console.log('🚀 Frontend: Executing redirect to consultant dashboard');
          router.push('/consultant-portal/dashboard');
        }, 100);
      },
      onError: (error: any) => {
        console.error('❌ Frontend: Consultant login error occurred:', error);
        const errorMessage = error?.response?.data?.message ||
                           error?.message ||
                           "Login failed. Please check your credentials.";
        setLoginError(errorMessage);
      },
    });
  };

  const field =
    "flex h-9 w-full rounded-[6px] border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-[14px] text-[var(--ink)] placeholder:text-[var(--faint)] hover:border-[var(--faint)] focus-visible:border-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/25";

  return (
    <AuthLayout
      title="Consultant sign in"
      subtitle="Timesheets, deliverables and payment requests for your engagements."
      audience="consultant"
      showPortalSwitch
      footer={
        <p>
          Need access? <AuthLink href="mailto:hr@ahni.org">Contact HR</AuthLink>
        </p>
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
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="c-email" className="text-[13.5px] font-medium">
            Email address
          </label>
          <input
            id="c-email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
            required
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="c-password" className="text-[13.5px] font-medium">
              Password
            </label>
            <a
              href="mailto:hr@ahni.org?subject=Consultant%20portal%20password%20reset"
              className="text-[13px] text-[var(--muted)] underline decoration-[var(--line-strong)] underline-offset-4 hover:text-[var(--ink)]"
            >
              Forgot password?
            </a>
          </div>
          <input
            id="c-password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
            required
          />
        </div>
        <FormButton loading={isPending} type="submit" className="h-10 w-full" size="lg">
          Sign in
        </FormButton>
      </form>
    </AuthLayout>
  );
}

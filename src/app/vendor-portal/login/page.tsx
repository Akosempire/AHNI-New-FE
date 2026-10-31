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

import DemoLoginHint from "@/components/DemoLoginHint";

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
    <div className="flex flex-1 h-screen">
      <div className="flex bg-[#FEF2F2] w-full">
        {/* Left Panel - Login Form */}
        <div className="w-full flex flex-1 items-center justify-center px-8">
          <div className="w-full max-w-md">
            {/* Home Button */}
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-primary border-gray-300 hover:border-primary"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>

            <DemoLoginHint kind="vendor" />
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <img src="/imgs/logo.png" className="w-[130px] mx-auto" />
                <div className="flex flex-col items-center gap-y-14 mt-10 py-10">
                  {/* Header */}
                  <div>
                    <h1 className="text-2xl font-bold text-center">Vendor Portal Login</h1>
                    <p className="text-center text-[#667185] mt-1">
                      Enter your credentials to access your account
                    </p>
                  </div>

                  {/* Auto-redirect Warning */}
                  {isRedirecting && (
                    <Alert className="w-full border-orange-200 bg-orange-50">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        <div className="flex items-center justify-between">
                          <span>Already logged in. Redirecting to dashboard...</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClearSession}
                            className="ml-2 border-orange-300 text-orange-700 hover:bg-orange-100"
                          >
                            Clear Session
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Error Alert */}
                  {loginError && (
                    <Alert variant="destructive" className="w-full">
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-8 self-stretch">
                    <FormInput
                      label="Email Address"
                      placeholder="Enter email"
                      required
                      type="email"
                      name="email"
                      className="border-primary"
                    />

                    <div>
                      <div className="flex flex-col gap-1">
                        <FormInput
                          label="Password"
                          placeholder="Enter password"
                          required
                          type="password"
                          name="password"
                          className="border-primary"
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            className="border-gray-500"
                            checked={rememberMe}
                            onCheckedChange={setRememberMe}
                          />
                          <label className="font-semibold">
                            Remember me
                          </label>
                        </div>
                        <button
                          type="button"
                          className="font-medium text-primary text-sm hover:underline"
                          onClick={() => {/* Add forgot password logic */}}
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Login Button */}
                  <div className="w-full self-stretch">
                    <FormButton
                      loading={isPending}
                      className="w-full rounded-full"
                      size="lg"
                    >
                      Login
                    </FormButton>
                  </div>

                  {/* Test Credentials - Compact Developer Section */}
                  <div className="w-full self-stretch pt-4">
                    <details className="group">
                      <summary className="flex cursor-pointer items-center justify-center gap-2 text-xs text-gray-400 hover:text-gray-600">
                        <span>Test Accounts</span>
                        <svg className="h-3 w-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="mt-3 space-y-2">
                        <div className="rounded bg-blue-50 p-2 text-xs">
                          <div className="font-medium text-blue-900">Demo Account:</div>
                          <div className="font-mono text-blue-700">test@vendor.com / test123</div>
                          <div className="text-blue-600 mt-1">✓ Full mock data available</div>
                        </div>
                        <div className="rounded bg-amber-50 p-2 text-xs border border-amber-200">
                          <div className="font-medium text-amber-900">Live Backend Access:</div>
                          <div className="text-amber-700 mt-1">
                            <div>• Backend API is fully operational</div>
                            <div>• Test vendor accounts need to be created</div>
                            <div>• Contact: procurement@ahni.org</div>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>

                  {/* Help Links */}
                  <div className="text-center text-xs text-gray-400 mt-4">
                    Don't have an account?{" "}
                    <a
                      href="/eoi"
                      className="font-medium text-primary hover:underline"
                    >
                      Register through EOI
                    </a>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Right Panel - Background Image with Overlay */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center bg-[url('/img/login.jpeg')] bg-[#161630B2] bg-blend-overlay bg-opacity-100">
          <div className="font-bold text-xl text-white text-center">
            Empowering vendors and suppliers to <br />
            build stronger communities through <br />
            innovative partnerships
          </div>
        </div>
      </div>
    </div>
  );
}
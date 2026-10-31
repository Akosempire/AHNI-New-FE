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

import DemoLoginHint from "@/components/DemoLoginHint";

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

  return (
    <div className="flex flex-1 h-screen relative">
      {/* Home Button - Top Left Corner */}
      <div className="absolute top-6 left-6 z-50">
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary border-gray-300 hover:border-primary px-6 py-2"
        >
          <Home className="h-5 w-5" />
          Home
        </Button>
      </div>

      <div className="flex bg-[#FEF2F2] w-full">
        {/* Left Panel - Login Form */}
        <div className="w-full flex flex-1 items-center justify-center">
          <div>
            <DemoLoginHint kind="consultant" />
            <form onSubmit={handleSubmit}>
              <img src="/imgs/logo.png" className="w-[130px] mx-auto" />
              <Card className="max-w-[500px] flex flex-col items-center gap-y-14 mt-10 py-10">
                {/* Header */}
                <div>
                  <h1 className="text-2xl font-bold text-center">Consultant Portal Login</h1>
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
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full px-4 py-3.5 text-base border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex flex-col gap-1">
                      <label className="block text-sm font-medium mb-2">Password *</label>
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="w-full px-4 py-3.5 text-base border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          className="border-gray-500"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <label className="font-semibold text-sm">
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

                {/* Help Links */}
                <div className="text-center text-xs text-gray-400">
                  Need help accessing your account?{" "}
                  <a
                    href="mailto:hr@ahni.org"
                    className="font-medium text-primary hover:underline"
                  >
                    Contact HR
                  </a>
                </div>
              </Card>
            </form>
          </div>
        </div>

        {/* Right Panel - Background Image with Overlay */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center bg-[url('/img/login.jpeg')] bg-[#161630B2] bg-blend-overlay bg-opacity-100">
          <div className="font-bold text-xl text-white text-center">
            Empowering consultants to deliver <br />
            exceptional services and drive <br />
            meaningful impact in communities
          </div>
        </div>
      </div>
    </div>
  );
}

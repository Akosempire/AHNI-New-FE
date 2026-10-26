import FormButton from "@/components/FormButton";
import { toast } from "sonner";
import { OtpInput } from "reactjs-otp-input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout, { AuthLink } from "@/components/app/AuthLayout";
import { useForgotPassword } from "../../controllers/authController";
import useQuery from "@/hooks/useQuery";

export default function VerifyOTPForm() {
    const [countTimer, setCountTimer] = useState(60);

    const query = useQuery();

    const [loading, setLoading] = useState(false);
    const [otpValue, setOtpValue] = useState("");

    const router = useRouter();

    const handleChange = (otpInputValue: string) => {
        setOtpValue(otpInputValue);
    };

    useEffect(() => {
        if (countTimer > 0) {
            const timerID = setInterval(() => {
                setCountTimer((prevCountTimer) => prevCountTimer - 1);
            }, 1000);

            return () => clearInterval(timerID);
        }
    }, [countTimer]);

    const { forgotPassword } = useForgotPassword();

    // Actually request a new code (previously this only showed a toast)
    const handleResendOTP = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();
        const email = query?.get("email");
        if (!email) {
            toast.error("We couldn't find your email address. Please start again.");
            router.push("/auth/forgot-password");
            return;
        }
        setLoading(true);
        try {
            await forgotPassword({ email });
            setCountTimer(60);
            toast.success("We've sent a new code to your email.");
        } catch {
            /* error toast is shown by the API layer */
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const email = query?.get("email");
        if (otpValue.length !== 6) {
            toast.error("Enter all 6 digits of the code.");
            return;
        }

        try {
            localStorage.setItem("authToken", JSON.stringify(otpValue));
            router.push(`/auth/change-password?email=${email}`);
        } catch (error: any) {
            toast.error(
                error.data.non_field_errors[0] || "Something went wrong"
            );
        }
    };
    const email = query?.get("email");
    return (
        <AuthLayout
            step="Step 2 of 3"
            title="Check your email"
            subtitle={
                <>
                    Enter the 6-digit code we sent{email ? <> to <b className="text-[var(--ink)]">{email}</b></> : null}.
                </>
            }
            footer={
                <p>
                    Wrong email? <AuthLink href="/auth/forgot-password">Start again</AuthLink>
                </p>
            }
        >
            <form className="space-y-6" onSubmit={onSubmit} noValidate>
                <fieldset>
                    <legend className="sr-only">6-digit code</legend>
                    <div className="[&_input]:!h-12 [&_input]:!w-11 [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line-strong)] [&_input]:bg-[var(--surface)] [&_input]:text-[20px] [&_input]:font-bold [&_input:focus]:border-[var(--ink)] [&_input:focus]:outline-none sm:[&_input]:!w-12">
                        <OtpInput numInputs={6} separator={<span className="w-2" />} onChange={handleChange} shouldAutoFocus value={otpValue} isInputNum />
                    </div>
                </fieldset>

                <p className="text-[14px] text-[var(--muted)]" aria-live="polite">
                    {countTimer > 0 ? (
                        <>You can request a new code in <b className="tabular-nums text-[var(--ink)]">0:{String(countTimer).padStart(2, "0")}</b></>
                    ) : (
                        <button type="button" onClick={handleResendOTP} disabled={loading} className="font-semibold text-[var(--brand-ink)] hover:underline disabled:opacity-50">
                            {loading ? "Sending…" : "Send a new code"}
                        </button>
                    )}
                </p>

                <FormButton type="submit" disabled={otpValue.length !== 6} className="h-12 w-full rounded-xl bg-[var(--ink)] text-[15px] font-bold text-[var(--surface)] hover:bg-black" size="lg">
                    Continue
                </FormButton>
            </form>
        </AuthLayout>
    );
}

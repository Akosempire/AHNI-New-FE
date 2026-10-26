"use client";

import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormInput from "@/components/FormInput";
import FormButton from "@/components/FormButton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AuthLayout, { AuthLink } from "@/components/app/AuthLayout";
import { useForgotPassword } from "../../controllers/authController";

const emailSchema = z.object({
    email: z.string().email(),
});

const ForgotPasswordForm = () => {
    const form = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: "",
        },
    });

    const { watch } = form;

    const { forgotPassword, isLoading } = useForgotPassword();

    const router = useRouter();

    const onSubmit = async (values: z.infer<typeof emailSchema>) => {
        try {
            const response = await forgotPassword(values);

            // Check both response.token and response.data.token for flexibility
            const token = response?.token || response?.data?.token;

            if (token) {
                localStorage.setItem("authToken", JSON.stringify(token));
            }

            // Redirect to OTP verification page
            router.push(`/auth/verify-otp?email=${watch("email")}`);
        } catch (error) {
            console.error("Forgot password submission error:", error);
            // Error toast is already shown by the API manager
        }
    };

    return (
        <AuthLayout
            step="Step 1 of 3"
            title="Reset your password"
            subtitle="Enter the email linked to your account and we'll send you a 6-digit code."
            footer={
                <p>
                    Remembered it? <AuthLink href="/auth/login">Back to sign in</AuthLink>
                </p>
            }
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    <FormInput label="Email address" required type="email" name="email" placeholder="name@ahnigeria.org" autoComplete="email" />
                    <FormButton loading={isLoading} className="h-12 w-full rounded-xl bg-[var(--ink)] text-[15px] font-bold text-[var(--surface)] hover:bg-black" size="lg">
                        Send code
                    </FormButton>
                </form>
            </Form>
        </AuthLayout>
    );
};

export default ForgotPasswordForm;
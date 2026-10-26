"use client";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { useRouter } from "next/navigation";
import AppShell from "@/components/app/AppShell";
import Suspense from "@/components/Suspense";
import { useEffect } from "react";
import { useAuthInitialization } from "@/hooks/useAuthInitialization";
import { useSessionManager } from "@/hooks/useSessionManager";
import { toast } from "sonner";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    // Initialize authentication state properly
    const { isInitialized, isAuthenticated } = useAuthInitialization();

    // Session manager for activity-based token refresh and idle timeout
    useSessionManager({
        enabled: isInitialized && isAuthenticated,
        idleTimeoutMs: 10 * 60 * 1000, // 10 minutes idle timeout
        refreshIntervalMs: 5 * 60 * 1000, // Refresh token every 5 minutes while active
        onSessionExpired: () => {
            toast.error("Your session has expired due to inactivity. Please log in again.");
        },
        onTokenRefreshed: () => {
            console.log("🔄 Session extended due to user activity");
        },
    });

    useEffect(() => {
        // Wait for auth initialization before checking
        if (isInitialized && !isAuthenticated) {
            console.log('🔄 No authentication detected, redirecting to login');
            router.push("/auth/login");
        }
    }, [router, isInitialized, isAuthenticated]);

    return (
        <AppShell>
            <Suspense>{children}</Suspense>
        </AppShell>
    );
}

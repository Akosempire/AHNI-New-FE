"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { AuthRoutes } from "@/constants/RouterConstants";
import { useAppDispatch } from "@/hooks/useStore";
import { logOut } from "@/store/auth/authSlice";
import { logoutStateManager } from "@/utils/errorHandlers";

/** Same sign-out sequence the old Header used, extracted so the shell can reuse it. */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useCallback(async () => {
    try {
      logoutStateManager.setLoggingOut(true);
      dispatch(logOut());
      try {
        ["token", "refresh_token", "user", "vendor_access_token", "vendor_refresh_token", "vendor_user", "persist:ahni"].forEach(
          (k) => localStorage.removeItem(k)
        );
      } catch {
        /* storage unavailable */
      }
      queryClient.clear();
      try {
        router.push(AuthRoutes.LOGIN);
      } catch {
        window.location.href = AuthRoutes.LOGIN;
      }
    } finally {
      setTimeout(() => logoutStateManager.setLoggingOut(false), 2000);
    }
  }, [dispatch, queryClient, router]);
}

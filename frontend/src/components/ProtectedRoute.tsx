"use client";

/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: Route guard that redirects unauthenticated users to login.
 *
 * Wraps a page that requires a logged-in user.
 *
 * Waits for the initial `/api/auth/me` check (`isLoading`) before deciding
 * anything -- redirecting too early would either flash the wrong page or
 * bounce a genuinely logged-in user back to /login before their session
 * has had a chance to restore.
 */
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth-context";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Loading...</p>
      </main>
    );
  }

  return <>{children}</>;
}

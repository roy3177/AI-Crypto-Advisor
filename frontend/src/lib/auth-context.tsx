"use client";

/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: React context providing authentication state across the app.
 *
 * Central authentication state, shared across the app via React context.
 *
 * On mount it tries `GET /api/auth/me` using whatever token is already in
 * storage, to restore the session after a page reload -- the backend
 * remains the source of truth for who the current user is, not anything
 * cached in the frontend.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { fetchCurrentUser, loginRequest, signupRequest, type AuthUser } from "./auth-api";
import { clearToken, setToken } from "./token-storage";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Re-fetches the current user from the backend and updates state.
   * Used after an action that changes server-side user data (like
   * completing onboarding) without requiring a full page reload. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function routeAfterAuth(router: ReturnType<typeof useRouter>, user: AuthUser) {
  router.push(user.onboarding_completed ? "/dashboard" : "/onboarding");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    fetchCurrentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch(() => {
        // No valid session (no token, expired token, ...) -- make sure we
        // don't hold on to a stale token.
        if (!cancelled) {
          clearToken();
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginRequest({ email, password });
      setToken(response.access_token);
      setUser(response.user);
      routeAfterAuth(router, response.user);
    },
    [router],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await signupRequest({ name, email, password });
      setToken(response.access_token);
      setUser(response.user);
      routeAfterAuth(router, response.user);
    },
    [router],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

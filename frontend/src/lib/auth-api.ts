/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: API functions for signup, login, and fetching the current user.
 *
 * Auth-specific calls, built on the centralized `apiFetch`. Keeping these
 * here (rather than inline in components) means the request shape only
 * needs to match the backend in one place.
 */
import { apiFetch } from "./api-client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  onboarding_completed: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

export function signupRequest(data: { name: string; email: string; password: string }): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function loginRequest(data: { email: string; password: string }): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function fetchCurrentUser(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/me");
}

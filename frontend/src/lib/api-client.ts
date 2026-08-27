/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: Centralized fetch wrapper for every request to the backend API.
 *
 * Centralized API client.
 *
 * Every request to the FastAPI backend must go through `apiFetch` instead of
 * calling `fetch` directly from components. That keeps the base URL, error
 * handling, and (later) auth-token attachment in one place instead of
 * duplicated across the app.
 *
 * The backend URL comes from an environment variable so it is never
 * hardcoded, per the project's frontend rules.
 */

import { getToken } from "./token-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Thin wrapper around `fetch` that targets the backend API, sends JSON,
 * attaches the stored access token when one exists, and throws a typed
 * `ApiError` on non-2xx responses instead of leaving callers to check
 * `response.ok` everywhere.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers, ...rest } = options;
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new ApiError(detail?.detail ?? "Request failed", response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

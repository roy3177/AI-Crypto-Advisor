/**
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
 * Thin wrapper around `fetch` that targets the backend API, sends JSON, and
 * throws a typed `ApiError` on non-2xx responses instead of leaving callers
 * to check `response.ok` everywhere.
 *
 * Attaching the JWT for authenticated requests is added in the
 * /build-authentication phase, once the token storage strategy is decided.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
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

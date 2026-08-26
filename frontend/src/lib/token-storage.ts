/**
 * Single place that touches the stored access token.
 *
 * Stored in `localStorage` for this MVP (see AuthProvider / SKILL.md for the
 * XSS tradeoff this implies). Every read/write is wrapped in try/catch
 * because localStorage can throw in some browser contexts (private
 * browsing, disabled storage) -- callers should degrade to "not logged in"
 * rather than crash.
 */
const TOKEN_KEY = "crypto_advisor_access_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Token simply won't persist across reloads in this session.
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to do -- there was likely nothing stored anyway.
  }
}

import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: mocks.useAuth,
}));

export const useAuthMock = mocks.useAuth;

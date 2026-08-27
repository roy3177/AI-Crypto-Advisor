/**
 * Shared `next/navigation` mock. `vi.mock` factories are hoisted above
 * imports, so the mock functions are created with `vi.hoisted` and
 * re-exported here for test files to both install the mock and assert
 * against the same function references.
 */
import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  pathname: "/",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mocks,
  usePathname: () => mocks.pathname,
}));

export const routerMock = mocks;

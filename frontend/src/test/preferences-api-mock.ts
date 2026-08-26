import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchPreferenceOptions: vi.fn(),
  fetchMyPreferences: vi.fn(),
  saveMyPreferences: vi.fn(),
}));

vi.mock("@/lib/preferences-api", () => mocks);

export const preferencesApiMock = mocks;

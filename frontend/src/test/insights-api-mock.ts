import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchDailyInsight: vi.fn(),
}));

vi.mock("@/lib/insights-api", () => mocks);

export const insightsApiMock = mocks;

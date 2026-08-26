import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchPrices: vi.fn(),
  fetchNews: vi.fn(),
}));

vi.mock("@/lib/market-api", () => mocks);

export const marketApiMock = mocks;

import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchRandomMeme: vi.fn(),
}));

vi.mock("@/lib/memes-api", () => mocks);

export const memesApiMock = mocks;

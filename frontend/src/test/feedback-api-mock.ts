import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchMyFeedback: vi.fn(),
  upsertFeedback: vi.fn(),
}));

vi.mock("@/lib/feedback-api", () => mocks);

export const feedbackApiMock = mocks;

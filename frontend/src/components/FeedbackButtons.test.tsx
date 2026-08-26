import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import "@/test/feedback-api-mock";
import { feedbackApiMock } from "@/test/feedback-api-mock";

import { FeedbackButtons } from "./FeedbackButtons";

describe("FeedbackButtons", () => {
  beforeEach(() => {
    feedbackApiMock.upsertFeedback.mockReset();
  });

  it("renders both thumbs-up and thumbs-down buttons", () => {
    render(<FeedbackButtons sectionType="crypto_meme" contentKey="meme:1" initialVote={null} />);
    expect(screen.getByRole("button", { name: "Thumbs up" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thumbs down" })).toBeInTheDocument();
  });

  it("shows an unselected state when there is no initial vote", () => {
    render(<FeedbackButtons sectionType="crypto_meme" contentKey="meme:1" initialVote={null} />);
    expect(screen.getByRole("button", { name: "Thumbs up" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Thumbs down" })).toHaveAttribute("aria-pressed", "false");
  });

  it("shows thumbs up as selected when the initial vote is 1", () => {
    render(<FeedbackButtons sectionType="crypto_meme" contentKey="meme:1" initialVote={1} />);
    expect(screen.getByRole("button", { name: "Thumbs up" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows thumbs down as selected when the initial vote is -1", () => {
    render(<FeedbackButtons sectionType="crypto_meme" contentKey="meme:1" initialVote={-1} />);
    expect(screen.getByRole("button", { name: "Thumbs down" })).toHaveAttribute("aria-pressed", "true");
  });

  it("submits a vote of 1 when thumbs up is clicked", async () => {
    feedbackApiMock.upsertFeedback.mockResolvedValue({
      section_type: "crypto_meme",
      content_key: "meme:1",
      vote: 1,
      updated_at: "",
    });
    const user = userEvent.setup();
    render(<FeedbackButtons sectionType="crypto_meme" contentKey="meme:1" initialVote={null} />);

    await user.click(screen.getByRole("button", { name: "Thumbs up" }));

    await waitFor(() =>
      expect(feedbackApiMock.upsertFeedback).toHaveBeenCalledWith({
        section_type: "crypto_meme",
        content_key: "meme:1",
        vote: 1,
      }),
    );
    expect(screen.getByRole("button", { name: "Thumbs up" })).toHaveAttribute("aria-pressed", "true");
  });

  it("restores the previous vote when saving fails", async () => {
    feedbackApiMock.upsertFeedback.mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();
    render(<FeedbackButtons sectionType="crypto_meme" contentKey="meme:1" initialVote={null} />);

    await user.click(screen.getByRole("button", { name: "Thumbs up" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/could not save/i);
    expect(screen.getByRole("button", { name: "Thumbs up" })).toHaveAttribute("aria-pressed", "false");
  });
});

"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

import { upsertFeedback, type SectionType } from "@/lib/feedback-api";

interface FeedbackButtonsProps {
  sectionType: SectionType;
  contentKey: string;
  /** The user's existing vote for this content, loaded once with the rest
   * of the dashboard data (see GET /api/feedback/me) -- not fetched again
   * per card. */
  initialVote: 1 | -1 | null;
}

/**
 * One reusable thumbs-up/thumbs-down control, used by all four dashboard
 * sections so voting logic exists in exactly one place.
 *
 * Optimistic UI: the click is reflected immediately, then confirmed or
 * rolled back once the request settles, so the button never keeps
 * displaying a vote that failed to save.
 */
export function FeedbackButtons({ sectionType, contentKey, initialVote }: FeedbackButtonsProps) {
  const [vote, setVote] = useState<1 | -1 | null>(initialVote);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep in sync if the parent reloads dashboard data with a different vote.
  // Adjusting state during render (React's documented pattern for this,
  // rather than an effect) so it takes effect before the next paint.
  const [prevInitialVote, setPrevInitialVote] = useState(initialVote);
  if (initialVote !== prevInitialVote) {
    setPrevInitialVote(initialVote);
    setVote(initialVote);
  }

  async function handleVote(newVote: 1 | -1) {
    if (isSaving) return;
    const previousVote = vote;
    setError(null);
    setVote(newVote);
    setIsSaving(true);
    try {
      const saved = await upsertFeedback({ section_type: sectionType, content_key: contentKey, vote: newVote });
      setVote(saved.vote);
    } catch {
      setVote(previousVote);
      setError("Could not save your feedback.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-pressed={vote === 1}
        aria-label="Thumbs up"
        disabled={isSaving}
        onClick={() => handleVote(1)}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors disabled:opacity-50 ${
          vote === 1
            ? "border-success bg-success-soft text-success"
            : "border-surface-border text-muted hover:border-success/40 hover:text-success"
        }`}
      >
        <ThumbsUp className="h-5 w-5" />
        {vote === 1 && <span className="sr-only"> (selected)</span>}
      </button>
      <button
        type="button"
        aria-pressed={vote === -1}
        aria-label="Thumbs down"
        disabled={isSaving}
        onClick={() => handleVote(-1)}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors disabled:opacity-50 ${
          vote === -1
            ? "border-danger bg-danger-soft text-danger"
            : "border-surface-border text-muted hover:border-danger/40 hover:text-danger"
        }`}
      >
        <ThumbsDown className="h-5 w-5" />
        {vote === -1 && <span className="sr-only"> (selected)</span>}
      </button>
      {error && (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
}

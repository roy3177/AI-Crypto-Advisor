import { FeedbackButtons } from "@/components/FeedbackButtons";
import { cardClassName } from "@/components/ui/styles";
import type { Meme } from "@/lib/memes-api";

interface MemeCardProps {
  data: Meme | null;
  isLoading: boolean;
  error: string | null;
  currentVote: 1 | -1 | null;
}

/**
 * "Fun Crypto Meme" dashboard section -- one of the four mandatory
 * sections. `image_url` is a path served by the frontend's own /public
 * folder (see frontend/public/memes/), not fetched from the backend, so
 * it resolves correctly regardless of which origin the API runs on.
 *
 * Images are 800x800 (square) originals -- `aspect-square` keeps the
 * layout stable instead of hardcoding pixel dimensions.
 */
export function MemeCard({ data, isLoading, error, currentVote }: MemeCardProps) {
  return (
    <section className={`${cardClassName} items-center`}>
      <h2 className="self-start text-lg font-semibold">Fun Crypto Meme</h2>

      {isLoading && <p className="text-sm text-muted">Loading today&apos;s meme...</p>}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {data && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- local file served from /public, no remote optimization needed */}
          <img
            src={data.image_url}
            alt={data.alt_text}
            className="aspect-square w-full max-w-xs rounded-lg border border-surface-border object-cover"
          />
          <p className="text-sm font-medium">{data.title}</p>
          <FeedbackButtons sectionType="crypto_meme" contentKey={data.content_key} initialVote={currentVote} />
        </>
      )}
    </section>
  );
}

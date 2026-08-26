import type { Meme } from "@/lib/memes-api";

interface MemeCardProps {
  data: Meme | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * "Fun Crypto Meme" dashboard section -- one of the four mandatory
 * sections. `image_url` is a path served by the frontend's own /public
 * folder (see frontend/public/memes/), not fetched from the backend, so
 * it resolves correctly regardless of which origin the API runs on.
 */
export function MemeCard({ data, isLoading, error }: MemeCardProps) {
  return (
    <section className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="self-start text-lg font-semibold">Fun Crypto Meme</h2>

      {isLoading && <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading today&apos;s meme...</p>}
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {data && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- local SVG served from /public, no optimization needed */}
          <img
            src={data.image_url}
            alt={data.alt_text}
            className="w-full max-w-xs rounded-md"
            width={400}
            height={300}
          />
          <p className="text-sm font-medium">{data.title}</p>
        </>
      )}
    </section>
  );
}

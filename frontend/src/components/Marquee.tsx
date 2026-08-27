interface MarqueeProps {
  items: string[];
  reverse?: boolean;
  durationSeconds?: number;
  className?: string;
}

/**
 * A column of pills scrolling continuously top-to-bottom (or reversed).
 * Purely decorative (aria-hidden). `items` is rendered twice back-to-back
 * so the loop can be seamless -- see the comment on the `marquee-vertical`
 * keyframes in globals.css for why that makes translateY(-50%) work as a
 * perfect loop point instead of a visible jump.
 */
export function Marquee({ items, reverse = false, durationSeconds = 22, className = "" }: MarqueeProps) {
  return (
    <div className={`relative h-80 w-32 overflow-hidden sm:w-36 ${className}`} aria-hidden="true">
      <div
        className={`flex flex-col gap-4 ${reverse ? "animate-marquee-up" : "animate-marquee-down"}`}
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {[...items, ...items].map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex items-center justify-center rounded-xl border border-surface-border bg-surface px-3 py-4 text-center text-sm font-semibold text-accent shadow-card"
          >
            {item}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

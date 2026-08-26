/**
 * Shared class-name fragments for the dashboard section cards. Kept as a
 * plain string (not a wrapping component) so callers can keep using the
 * semantically-correct `<section>` element instead of a generic `<div>`.
 */
export const cardClassName =
  "flex flex-col gap-3 rounded-xl border border-surface-border bg-surface p-5 shadow-card transition-shadow hover:shadow-card-hover";

export const badgeClassName = "rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent";

/** Shared with Button.tsx, and reused directly on `<Link>` elements that
 * need to look like a button (Next.js Link can't render as a <button>). */
export const buttonBaseClassName =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const buttonVariantClassName = {
  primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary: "border border-surface-border bg-surface text-foreground hover:bg-accent-soft",
  ghost: "text-muted hover:text-foreground",
} as const;

export const inputClassName =
  "rounded-lg border border-surface-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30";

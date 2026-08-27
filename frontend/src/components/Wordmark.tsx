/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: The app's logo and name, used in headers and auth pages.
 */

import { LineChart } from "lucide-react";
import Link from "next/link";

interface WordmarkProps {
  className?: string;
  /** "lg" is used on the login/signup pages, where the wordmark stands
   * more on its own instead of sharing a header row. */
  size?: "sm" | "lg";
}

export function Wordmark({ className = "", size = "sm" }: WordmarkProps) {
  const isLarge = size === "lg";
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <span
        className={`flex items-center justify-center rounded-lg bg-accent ${isLarge ? "h-11 w-11 rounded-xl" : "h-7 w-7"}`}
      >
        <LineChart className={isLarge ? "h-6 w-6 text-accent-foreground" : "h-4 w-4 text-accent-foreground"} strokeWidth={2.5} />
      </span>
      <span className={`font-display font-semibold tracking-tight ${isLarge ? "text-2xl" : "text-[15px]"}`}>
        Crypto Advisor
      </span>
    </Link>
  );
}

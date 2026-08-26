import { LineChart } from "lucide-react";
import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
        <LineChart className="h-4 w-4 text-accent-foreground" strokeWidth={2.5} />
      </span>
      <span className="font-display text-[15px] font-semibold tracking-tight">Crypto Advisor</span>
    </Link>
  );
}

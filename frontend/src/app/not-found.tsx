import Image from "next/image";
import Link from "next/link";

import { Wordmark } from "@/components/Wordmark";
import { buttonBaseClassName, buttonVariantClassName } from "@/components/ui/styles";

/**
 * Custom 404 page (Next.js convention: `not-found.tsx` at the app root
 * renders for any unmatched route). Static -- no data fetching, no auth
 * check, so it always renders regardless of login state.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 p-8 text-center">
      <Wordmark />
      <Image
        src="/illustrations/not-found.webp"
        alt="A cartoon bull mascot looking around with a magnifying glass"
        width={480}
        height={480}
        priority
        className="w-full max-w-[220px]"
      />
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-sm text-muted">
        We looked everywhere, but this page doesn&apos;t exist.
      </p>
      <Link href="/" className={`${buttonBaseClassName} ${buttonVariantClassName.primary} px-7`}>
        Back to home
      </Link>
    </main>
  );
}

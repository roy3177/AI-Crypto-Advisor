"use client";

/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: Shared top bar for authenticated pages.
 */
import { Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { buttonBaseClassName, buttonVariantClassName } from "@/components/ui/styles";
import { Wordmark } from "@/components/Wordmark";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/lib/theme-context";

/** Shared top bar for authenticated pages (onboarding, dashboard) so the
 * brand mark and logout control only need to be styled in one place. */
export function AppHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Onboarding doubles as the "edit preferences" screen once a user has
  // already completed it (see onboarding/page.tsx) -- surface a way back
  // into it from anywhere except the page itself.
  const showEditPreferences = user?.onboarding_completed && pathname !== "/onboarding";

  return (
    <header className="flex items-center justify-between border-b border-surface-border pb-4">
      <Wordmark size="lg" />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {showEditPreferences && (
          <Link href="/onboarding" className={`${buttonBaseClassName} ${buttonVariantClassName.ghost} !text-base px-2 py-1`}>
            <Settings className="h-4 w-4" /> Edit preferences
          </Link>
        )}
        {user && <span className="hidden text-base text-muted sm:inline">{user.name}</span>}
        <Button type="button" variant="ghost" onClick={logout} className="!text-base px-2 py-1">
          Log out
        </Button>
      </div>
    </header>
  );
}

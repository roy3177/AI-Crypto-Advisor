/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: Global site footer shown on every page.
 *
 * Rendered once, globally, from the root layout -- appears at the bottom
 * of every page. Deliberately minimal (a single centered line) so it
 * stays out of the way on focused screens like login/onboarding, not
 * just the marketing home page.
 */
export function Footer() {
  return (
    <footer className="border-t border-surface-border">
      <div className="mx-auto w-full max-w-5xl px-6 py-6 text-center text-base text-muted">
        <p>
          &copy; {new Date().getFullYear()} Crypto Advisor -- for informational purposes only, not financial advice.
        </p>
      </div>
    </footer>
  );
}

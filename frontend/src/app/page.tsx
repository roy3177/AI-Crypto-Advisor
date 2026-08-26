import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Moveo AI Crypto Advisor</h1>
      <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        Project scaffold in progress. Onboarding and the dashboard are built
        in later phases.
      </p>
      <div className="flex gap-4 text-sm font-medium">
        <Link href="/login" className="underline">
          Log in
        </Link>
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </div>
    </main>
  );
}

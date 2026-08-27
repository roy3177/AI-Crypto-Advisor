"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { AuthSidePanel } from "@/components/AuthSidePanel";
import { FormField } from "@/components/FormField";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/lib/theme-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>
        <Wordmark size="lg" />

        <div className="w-full max-w-lg rounded-2xl border border-surface-border bg-surface p-10 shadow-card-hover">
          <h1 className="mb-8 text-4xl font-extrabold tracking-tight">Log in</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <FormField label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
            <FormField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
            />
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
            <Button type="submit" disabled={isSubmitting} className="mt-2 w-full !py-3.5 !text-base">
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </div>
        <p className="text-base text-muted">
          No account?{" "}
          <Link href="/signup" className="font-semibold text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
      <AuthSidePanel />
    </main>
  );
}

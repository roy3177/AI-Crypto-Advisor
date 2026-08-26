"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
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
      <div className="hidden w-1/2 flex-col items-center justify-center gap-6 bg-accent-soft p-10 lg:flex">
        <Image
          src="/illustrations/auth-shield.webp"
          alt="A calm cartoon bull mascot meditating behind a glowing padlock shield"
          width={720}
          height={1073}
          priority
          className="w-full max-w-xs"
        />
        <p className="max-w-xs text-center text-sm text-muted">
          Your account is protected with secure password hashing and expiring access tokens.
        </p>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>
        <Wordmark />
        <div className="w-full max-w-sm rounded-xl border border-surface-border bg-surface p-6 shadow-card">
          <h1 className="mb-6 text-xl font-semibold">Log in</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
            <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </div>
        <p className="text-sm text-muted">
          No account?{" "}
          <Link href="/signup" className="font-medium text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

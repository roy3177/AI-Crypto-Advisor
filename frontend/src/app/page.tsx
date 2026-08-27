/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: The public landing page.
 */

import { Database, ImageIcon, KeyRound, LineChart, Newspaper, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { Illustration } from "@/components/Illustration";
import { Marquee } from "@/components/Marquee";
import { RadialBackground } from "@/components/RadialBackground";
import { Wordmark } from "@/components/Wordmark";
import { buttonBaseClassName, buttonVariantClassName } from "@/components/ui/styles";
import { LEFT_COINS, RIGHT_COINS } from "@/lib/crypto-marquee-coins";
import { ThemeToggle } from "@/lib/theme-context";

const FEATURES = [
  { icon: Newspaper, label: "Market News", desc: "Curated crypto headlines for your assets" },
  { icon: LineChart, label: "Coin Prices", desc: "Live prices and 24h movement" },
  { icon: Sparkles, label: "AI Insight", desc: "One personalized daily takeaway" },
  { icon: ImageIcon, label: "Crypto Meme", desc: "A little fun with your data" },
];

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "Passwords hashed, never stored in plain text" },
  { icon: KeyRound, label: "JWT sessions with expiration" },
  { icon: Database, label: "Preferences persisted in PostgreSQL" },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <RadialBackground />
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Wordmark />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className={`${buttonBaseClassName} ${buttonVariantClassName.ghost} hidden sm:inline-flex`}>
            Log in
          </Link>
          <Link href="/signup" className={`${buttonBaseClassName} ${buttonVariantClassName.primary}`}>
            Sign up
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-8 py-12 text-center">
        <div className="flex w-full max-w-3xl animate-fade-up flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-soft px-3.5 py-1.5 text-xs font-medium text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Personalized crypto dashboard
          </span>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">Crypto Advisor</h1>
          <p className="max-w-lg text-base text-muted sm:text-xl">
            Pick your assets, your investor style, and your content, get a daily dashboard built around them.
          </p>
        </div>

        <div className="flex animate-fade-up items-center justify-center gap-4 stagger-1">
          <Marquee items={LEFT_COINS} durationSeconds={24} className="hidden lg:block" />
          <Illustration
            src="/illustrations/hero-wave.webp"
            alt="A cheerful cartoon bull mascot waving hello"
            width={1120}
            height={611}
            priority
            wrapperClassName="mx-auto w-full max-w-xs"
          />
          <Marquee items={RIGHT_COINS} reverse durationSeconds={24} className="hidden lg:block" />
        </div>

        <div className="flex animate-fade-up flex-col items-center gap-4 stagger-2">
          <div className="flex gap-3">
            <Link href="/signup" className={`${buttonBaseClassName} ${buttonVariantClassName.primary} px-7`}>
              Sign up
            </Link>
            <Link href="/login" className={`${buttonBaseClassName} ${buttonVariantClassName.secondary} px-7`}>
              Log in
            </Link>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-foreground">
            {TRUST_POINTS.map((point) => (
              <li key={point.label} className="flex items-center gap-2">
                <point.icon className="h-4 w-4 text-accent" />
                {point.label}
              </li>
            ))}
          </ul>
        </div>

        <section className="w-full max-w-5xl animate-fade-up rounded-2xl bg-accent-soft/60 p-6 stagger-3 sm:p-8">
          <dl className="grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.label}
                className="rounded-xl border border-surface-border bg-surface p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <dt className="mt-3 text-lg font-semibold">{feature.label}</dt>
                <dd className="mt-1 text-sm text-muted">{feature.desc}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}

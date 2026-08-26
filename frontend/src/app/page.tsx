import { ImageIcon, LineChart, Newspaper, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Wordmark } from "@/components/Wordmark";
import { buttonBaseClassName, buttonVariantClassName } from "@/components/ui/styles";
import { ThemeToggle } from "@/lib/theme-context";

const FEATURES = [
  { icon: Newspaper, label: "Market News", desc: "Curated crypto headlines for your assets" },
  { icon: LineChart, label: "Coin Prices", desc: "Live prices and 24h movement" },
  { icon: Sparkles, label: "AI Insight", desc: "One personalized daily takeaway" },
  { icon: ImageIcon, label: "Crypto Meme", desc: "A little fun with your data" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
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
        <div className="grid w-full max-w-4xl animate-fade-up grid-cols-1 items-center gap-6 sm:grid-cols-2 sm:text-left">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-soft px-3.5 py-1.5 text-xs font-medium text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Personalized crypto dashboard
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Crypto Advisor</h1>
            <p className="max-w-md text-sm text-muted sm:text-base">
              Pick your assets, your investor style, and your content -- get a daily dashboard built around them.
            </p>
          </div>
          <Image
            src="/illustrations/hero-wave.webp"
            alt="A cheerful cartoon bull mascot waving hello"
            width={1120}
            height={611}
            priority
            className="order-first mx-auto w-full max-w-sm sm:order-last sm:max-w-none"
          />
        </div>

        <div className="flex animate-fade-up gap-3 stagger-1">
          <Link href="/signup" className={`${buttonBaseClassName} ${buttonVariantClassName.primary} px-7`}>
            Sign up
          </Link>
          <Link href="/login" className={`${buttonBaseClassName} ${buttonVariantClassName.secondary} px-7`}>
            Log in
          </Link>
        </div>

        <dl className="grid w-full max-w-3xl animate-fade-up grid-cols-2 gap-4 text-left sm:grid-cols-4 stagger-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.label}
              className="rounded-xl border border-surface-border bg-surface p-4 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
                <feature.icon className="h-5 w-5 text-accent" />
              </div>
              <dt className="mt-3 text-sm font-semibold">{feature.label}</dt>
              <dd className="mt-1 text-xs text-muted">{feature.desc}</dd>
            </div>
          ))}
        </dl>

        <p className="max-w-md text-xs text-muted">
          This content is for informational purposes only and is not financial advice.
        </p>
      </main>
    </div>
  );
}

/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: The dark brand panel shown beside the login/signup form.
 */

import { ImageIcon, LineChart, Newspaper, Sparkles } from "lucide-react";

import { Illustration } from "@/components/Illustration";

// The app's 4 mandatory dashboard sections (see CLAUDE.md) -- real
// features, not marketing copy invented for this panel.
const HIGHLIGHTS = [
  { icon: Newspaper, label: "Market News tailored to your assets" },
  { icon: LineChart, label: "Live coin prices with 24h movement" },
  { icon: Sparkles, label: "One personalized AI insight, every day" },
  { icon: ImageIcon, label: "A fresh crypto meme, every visit" },
];

/**
 * The dark panel shown beside the login/signup form on large screens.
 * Deliberately always-dark regardless of the site's light/dark toggle
 * (a fixed brand panel, like the reference this was modeled on) --
 * hidden below `lg` so mobile gets the form alone.
 */
export function AuthSidePanel() {
  return (
    <div className="hidden w-1/2 flex-col justify-between gap-10 bg-gradient-to-br from-violet-100 via-purple-200 to-indigo-200 p-12 lg:flex">
      <div className="flex flex-col gap-6">
        <h2 className="text-4xl font-extrabold tracking-tight text-indigo-950">
          A dashboard built around what you actually hold
        </h2>
        <p className="text-lg text-indigo-950/70">
          Pick your assets once during onboarding -- everything below is tailored around them.
        </p>
        <ul className="flex flex-col gap-4">
          {HIGHLIGHTS.map((item) => (
            <li key={item.label} className="flex items-center gap-3 text-lg font-medium text-indigo-950/90">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/50">
                <item.icon className="h-5 w-5 text-indigo-950" />
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-5 rounded-2xl border border-indigo-950/10 bg-white/50 p-6">
        <Illustration
          src="/illustrations/auth-shield.webp"
          alt="A calm cartoon bull mascot meditating behind a glowing padlock shield"
          width={720}
          height={1073}
          glow={false}
          wrapperClassName="w-24 flex-none"
        />
        <p className="text-base text-indigo-950/80">
          Your account is protected with secure password hashing and expiring access tokens.
        </p>
      </div>
    </div>
  );
}

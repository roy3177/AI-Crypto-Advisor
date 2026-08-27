# Crypto Advisor — Frontend

Next.js app for [Crypto Advisor](../README.md): landing page, authentication, onboarding, and the personalized dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?logo=vitest&logoColor=white)

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login`, `/signup` | Authentication, split-panel layout with a dark brand side panel |
| `/onboarding` | 3-step questionnaire (assets, investor type, content preferences) |
| `/dashboard` | The four personalized sections, protected by `ProtectedRoute` |
| `/not-found` | Custom 404 |

## Project structure

```text
src/
├── app/           Routes (App Router) — one folder per page
├── components/    Reusable UI (cards, forms, illustrations, layout)
│   └── ui/        Shared style primitives (Button, class-name constants)
├── lib/           API client, per-resource API modules, auth/theme context
└── test/          Shared Vitest mocks
```

- **Centralized API client** (`lib/api-client.ts`) — every request goes through one place; no duplicated fetch logic per page.
- **Reusable feedback control** (`components/FeedbackButtons.tsx`) — one component backs thumbs-up/down on all four dashboard sections, with optimistic UI and rollback on failure.
- **Auth state** (`lib/auth-context.tsx`) + `ProtectedRoute` — redirect logic lives in one place, not duplicated per page.

## Design system

- Design tokens (OKLCH colors, radii, shadows) live in `src/app/globals.css` as CSS custom properties, mapped into Tailwind via `@theme inline` — every color adapts automatically between light and dark mode.
- `lib/theme-context.tsx` handles the light/dark toggle with no flash-of-wrong-theme on load (an inline pre-hydration script sets the class before React mounts).
- `components/Illustration.tsx` and `components/Marquee.tsx` render the app's mascot illustrations and scrolling coin-name columns consistently (rounded corners, soft glow, seamless looping) — the raw Gemini-generated source images live in `public/illustrations/` and `public/memes/`.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The backend must be running separately — see [../backend/README.md](../backend/README.md).

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the FastAPI backend (defaults to `http://localhost:8000`) |

## Testing

```bash
npm test
```

Covers the login/signup forms, `ProtectedRoute`'s redirect logic, the onboarding questionnaire, the dashboard's four sections (loading, partial failure, fallback labeling, personalization-driven ordering), and the reusable feedback buttons (selected state, optimistic update, rollback on failure).

## Linting & type checking

```bash
npm run lint
npx tsc --noEmit
```

## Production build

```bash
npm run build
```

---

See the [repository root README](../README.md) for the full project overview, architecture, and deployment plan.

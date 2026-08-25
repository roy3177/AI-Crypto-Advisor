---
name: build-crypto-dashboard
description: Build, review, test, or modify the personalized daily dashboard for the Moveo AI Crypto Advisor. Use when working on dashboard orchestration, React or Next.js dashboard pages, market-news cards, coin-price cards, daily AI insight, crypto memes, feedback controls, personalization, loading states, partial failures, responsive design, accessibility, dashboard APIs, or dashboard tests. Inspect the existing authentication, onboarding, preferences, data integrations, AI insight, feedback system, frontend components, and tests before making changes.
argument-hint: "[backend|frontend|news|prices|insight|meme|personalization|tests|review]"
disable-model-invocation: false
---

# Build the Personalized Crypto Dashboard

Build and maintain the main dashboard for the Moveo AI Crypto Advisor.

The dashboard must display these four sections:

1. Market News.
2. Coin Prices.
3. AI Insight of the Day.
4. Fun Crypto Meme.

Every section must:

- Display meaningful content.
- Be connected to the authenticated user.
- Support thumbs-up and thumbs-down feedback.
- Handle loading, empty, and failure states.
- Remain usable on desktop and mobile.

The dashboard must use the user's onboarding preferences.

Do not build a generic dashboard that ignores saved preferences.

## Complete dashboard flow

```text
Authenticated user opens /dashboard
        ↓
Frontend restores authentication
        ↓
Backend confirms current user
        ↓
Is onboarding completed?
        ├── No  → Redirect to /onboarding
        └── Yes → Continue
                    ↓
              Load user preferences
                    ↓
              Load dashboard sections
                    ├── Coin prices
                    ├── Market news
                    ├── Daily AI insight
                    └── Crypto meme
                    ↓
              Attach current feedback state
                    ↓
              Display personalized dashboard
```

## Required sections

### Market News

Display relevant crypto-market news.

Use:

- Selected crypto assets.
- Normalized news data.
- Provider or fallback status.
- Stable content keys.
- Current user feedback.

Each displayed article should show:

- Headline.
- Publisher or source.
- Publication time when available.
- Short summary when available.
- Related assets when available.
- Link to the original article.
- Feedback controls.
- Fallback indication when applicable.

Do not render external article HTML.

Treat article titles, summaries, URLs, and images as untrusted external data.

### Coin Prices

Display price information for the user's selected assets.

Each coin card should show:

- Coin name.
- Symbol.
- Current USD price.
- 24-hour percentage change.
- Coin image when safely available.
- Last-updated time when available.
- Stale-data indication.
- Feedback controls for the section or selected price snapshot.

Use a clear visual difference between:

- Positive movement.
- Negative movement.
- No change.
- Missing data.

Do not use color as the only indicator.

Also use a sign, icon, or text.

### AI Insight of the Day

Display the stored personalized daily insight.

Show:

- Insight title.
- Insight content.
- Date or generation time.
- AI or fallback source state.
- Fixed financial disclaimer.
- Feedback controls.

Always display:

```text
This content is for informational purposes only and is not financial advice.
```

Do not render AI-generated HTML.

Render model output as plain text.

Do not generate a new insight on every dashboard render.

### Fun Crypto Meme

Display one crypto-related meme.

Show:

- Meme image.
- Optional short title or caption.
- Feedback controls.
- Loading and fallback states.

The meme should change dynamically according to a clear rule.

A valid MVP rule is:

```text
Choose one meme when the dashboard request is loaded.
Choose another on an explicit refresh action when possible.
```

Do not change the meme continuously during normal React rerenders.

Every meme must have a stable unique ID.

## Meme data source

For the MVP, prefer curated local JSON.

Suggested file:

```text
frontend/src/data/crypto-memes.json
```

or:

```text
backend/app/data/crypto-memes.json
```

Example:

```json
[
  {
    "id": "diamond-hands-01",
    "title": "Diamond hands",
    "image_url": "/memes/diamond-hands-01.webp",
    "alt_text": "Crypto investor holding through market volatility"
  },
  {
    "id": "market-dip-01",
    "title": "Buying the dip",
    "image_url": "/memes/market-dip-01.webp",
    "alt_text": "Humorous crypto market dip reaction"
  }
]
```

Prefer local image assets or trusted controlled URLs.

Rules:

- Every item must have a stable ID.
- Every image must have useful alternative text.
- Do not hotlink unreliable or unknown images.
- Do not scrape Reddit during every dashboard request.
- Do not include offensive or inappropriate content.
- Do not use copyrighted content carelessly.
- Add a local fallback meme.
- Avoid showing the same meme repeatedly when a simple alternative is
  available.

## Dashboard orchestration options

Two approaches are valid.

### Option A: Combined dashboard endpoint

```text
GET /api/dashboard
```

Example response:

```json
{
  "user": {
    "name": "Roy Meoded",
    "investor_type": "hodler"
  },
  "preferences": {
    "interested_assets": [
      "bitcoin",
      "ethereum"
    ],
    "content_types": [
      "market_news",
      "charts",
      "fun"
    ]
  },
  "prices": {
    "status": "live",
    "items": []
  },
  "news": {
    "status": "live",
    "items": []
  },
  "daily_insight": {
    "status": "available",
    "item": {}
  },
  "meme": {
    "status": "available",
    "item": {}
  },
  "generated_at": "2026-08-25T17:30:00Z"
}
```

Advantages:

- One initial frontend request.
- Consistent dashboard snapshot.
- Easy attachment of feedback state.
- Simpler page-level loading.

Tradeoff:

- The endpoint must preserve partial results.
- One slow provider must not block indefinitely.

### Option B: Separate section endpoints

```text
GET /api/market/prices
GET /api/market/news
GET /api/insights/daily
GET /api/memes/random
```

Advantages:

- Sections load independently.
- Easier isolated retries.
- One slow request does not delay every section.

Tradeoff:

- More frontend requests.
- More frontend orchestration.

Recommended MVP approach:

Use a combined dashboard endpoint when the backend can fetch independent
sections concurrently and return partial results.

Otherwise, use separate section requests.

Inspect the existing project before deciding.

Do not implement both approaches with duplicated business logic.

## Backend orchestration

When using a combined endpoint:

1. Authenticate the user.
2. Confirm onboarding completion.
3. Load preferences.
4. Start independent content operations.
5. Use finite timeouts.
6. Preserve successful sections.
7. Attach stable content keys.
8. Attach current-user feedback.
9. Return normalized section statuses.

Independent external calls may run concurrently.

Do not share one unsafe database session across concurrent tasks.

Complete necessary database reads before launching independent external
operations, or use safe session boundaries.

## Partial failure

One failed section must not break the entire dashboard.

Example:

```json
{
  "prices": {
    "status": "live",
    "items": []
  },
  "news": {
    "status": "fallback",
    "items": []
  },
  "daily_insight": {
    "status": "available",
    "item": {}
  },
  "meme": {
    "status": "available",
    "item": {}
  }
}
```

Possible section statuses:

```text
loading
live
cached
stale
fallback
available
unavailable
error
```

Use a small, documented set.

Do not represent a partial provider failure as a successful live result.

## Authentication rules

The dashboard must require authentication.

Use the backend's authenticated user dependency.

Do not accept:

```text
user_id
```

as a query parameter for personalized dashboard access.

The dashboard must use:

```text
current_user.id
```

If the token is missing, invalid, or expired:

- Backend returns `401`.
- Frontend clears invalid authentication state.
- Frontend navigates to login.

## Onboarding rules

If the user has not completed onboarding:

- Do not load a personalized dashboard with missing preferences.
- Return a controlled state from the backend.
- Redirect the frontend to `/onboarding`.

Avoid redirect loops.

Do not decide onboarding status only from old browser state.

## Personalization behavior

Use interested assets to:

- Select displayed coin prices.
- Rank or filter market news.
- Build the AI insight context.
- Create price-feedback identifiers.

Use investor type to:

- Adjust the AI insight style.
- Optionally adapt small educational labels.
- Avoid changing factual market data.

Use content preferences to:

- Order sections.
- Adjust section prominence.
- Select supporting content.

All four mandatory sections must remain available.

Example ordering:

```text
User prefers Market News
        ↓
Market News appears earlier or receives greater visual emphasis
```

Do not remove Coin Prices, AI Insight, or Meme because the user omitted one
content preference.

## Dashboard section ordering

Create one deterministic ordering function.

Possible default order:

```text
1. Coin Prices
2. Market News
3. AI Insight
4. Crypto Meme
```

Then move preferred content categories earlier while keeping every section.

Do not create unstable ordering on every render.

Do not allow feedback clicks to reorder the dashboard unexpectedly.

## Suggested frontend structure

Adapt to the existing project.

Example:

```text
frontend/src/
├── pages/
│   └── DashboardPage.tsx
├── components/
│   └── dashboard/
│       ├── DashboardHeader.tsx
│       ├── CoinPricesSection.tsx
│       ├── CoinPriceCard.tsx
│       ├── MarketNewsSection.tsx
│       ├── NewsCard.tsx
│       ├── DailyInsightCard.tsx
│       ├── CryptoMemeCard.tsx
│       ├── FeedbackButtons.tsx
│       ├── SectionSkeleton.tsx
│       ├── SectionError.tsx
│       └── EmptyState.tsx
├── hooks/
│   └── useDashboard.ts
├── services/
│   └── dashboardApi.ts
└── types/
    └── dashboard.ts
```

If using Next.js App Router, adapt routes and server/client boundaries
appropriately.

Do not force this structure onto an established project.

## Component responsibility

Keep components focused.

### DashboardPage

Responsible for:

- Page layout.
- Dashboard query.
- Section placement.
- Page-level navigation.
- Global refresh behavior.

### Section components

Responsible for:

- Rendering section data.
- Section-specific empty state.
- Section-specific error state.
- Section-level retry where supported.

### FeedbackButtons

Responsible for:

- Current vote.
- Vote submission.
- Saving state.
- Error recovery.
- Accessible controls.

Do not place all dashboard behavior inside one very large component.

## Data fetching

Use the project's established fetching approach.

Possible choices:

- Native `fetch`.
- Axios.
- TanStack Query.
- Next.js data fetching.

Do not add a large state-management dependency solely for one page.

The data layer must support:

- Authentication headers or selected cookie strategy.
- Loading state.
- Error state.
- Request cancellation where useful.
- Controlled retry.
- Cache or revalidation rules.
- No infinite request loops.

## Refresh behavior

Define the difference between:

### Browser rerender

Must not:

- Generate a new daily AI insight.
- Randomly change the meme repeatedly.
- Send uncontrolled duplicate API requests.

### Data refresh

May:

- Request current prices.
- Request current news.
- Request another meme according to product behavior.
- Return the same saved daily insight.
- Preserve stored feedback state.

Add an explicit refresh action only if it improves the UX.

Disable or debounce uncontrolled repeated refresh clicks.

## Loading states

Prefer section-level skeletons.

Examples:

- Price-card skeletons.
- News-card skeletons.
- Insight-text skeleton.
- Meme-image placeholder.

Do not display an empty white page while every request loads.

If using a combined endpoint, a page-level initial skeleton is acceptable,
followed by section-level states for retries.

Avoid excessive spinners.

## Empty states

Handle valid empty results.

Examples:

### No prices

```text
Price data is currently unavailable for your selected assets.
```

### No news

```text
No matching market news is available right now.
```

### Missing preferences

```text
Complete your preferences to personalize the dashboard.
```

### No meme

```text
Today's crypto humor is taking a break.
```

Do not present an empty array as a broken interface.

## Error states

Every section must have a controlled failure state.

Include:

- Short understandable message.
- Retry action when useful.
- Fallback indicator when fallback content exists.
- No raw stack traces.
- No provider implementation details.
- No secrets.

Example:

```text
Live market news is temporarily unavailable. Showing educational fallback
content.
```

## Price formatting

Format prices in the frontend using locale-aware formatting.

Examples:

```text
$112,000.25
$0.0042
```

Use appropriate precision:

- Large values need fewer decimal places.
- Very small values may need more decimal places.

Do not convert formatted strings back into calculations.

Format percentage change with:

- Sign.
- Consistent decimals.
- Direction indicator.
- Accessible text.

Example:

```text
▲ 2.40%
▼ 1.10%
```

## News presentation

Each card should prioritize readability.

Recommended fields:

```text
Headline
Publisher
Published time
Short summary
Related asset tags
Read article link
Feedback controls
```

Do not create fake summaries when the provider supplies none.

Do not make the entire card an inaccessible clickable area.

For external links:

```html
target="_blank"
rel="noopener noreferrer"
```

Use safe URLs only.

## AI insight presentation

The AI insight should appear as a prominent but concise card.

Display:

- Personalized title.
- Short insight.
- Optional “Generated for HODLer” label.
- Date.
- Fixed disclaimer.
- Feedback controls.

Do not describe the output as a guaranteed prediction.

Do not hide the disclaimer in a tooltip.

## Meme presentation

The meme card should:

- Preserve image aspect ratio.
- Avoid large layout shifts.
- Include alt text.
- Handle image-load failure.
- Have a stable feedback target.
- Display a safe fallback image or state.
- Avoid blocking the rest of the dashboard.

Use responsive image behavior.

## Feedback integration

Every feedback target should receive:

```text
section_type
content_key
current_user_vote
```

Recommended targets:

| Section | Feedback target |
|---|---|
| Market News | Each displayed article |
| Coin Prices | Daily prices section |
| AI Insight | Persisted daily insight |
| Crypto Meme | Displayed meme |

Use the reusable feedback component.

Do not duplicate voting API logic inside every section.

## Responsive design

The dashboard must work on:

- Mobile.
- Tablet.
- Desktop.

Recommended layout:

```text
Mobile  → One column
Tablet  → One or two columns
Desktop → Responsive two-column grid
```

Keep important content readable without horizontal scrolling.

Do not use fixed widths that break on small screens.

## Visual hierarchy

The page should include:

1. Greeting or dashboard title.
2. Short personalization summary.
3. Four clearly labeled sections.
4. Consistent card styling.
5. Clear primary and secondary information.
6. Visible feedback controls.
7. Accessible loading and error states.

Avoid:

- Excessive gradients.
- Too many unrelated colors.
- Unnecessary animations.
- Dense financial-terminal styling.
- Tiny text.
- Inconsistent card spacing.

Focus on clean UX, as requested by Moveo.

## Accessibility

Ensure:

- Semantic headings are used in order.
- Buttons use actual `<button>` elements.
- Images have useful alt text.
- Links have descriptive labels.
- Focus states are visible.
- Color is not the only status indicator.
- Loading states are announced when appropriate.
- Error messages are understandable.
- Feedback buttons expose selected state.
- Keyboard navigation works.
- Text has sufficient contrast.

## Performance

Keep initial loading efficient.

Apply:

- Limited news result count.
- Batched price requests.
- Backend cache where appropriate.
- Reuse of the saved daily insight.
- Optimized local meme images.
- Request deduplication.
- Lazy-loading for non-critical images where useful.

Avoid:

- One provider call per coin when batching is supported.
- One feedback request per card.
- Repeated AI generation.
- Huge image assets.
- Rendering an unbounded news list.

## Implementation workflow

### Step 1: Inspect the complete feature chain

Before modifying the dashboard:

1. Inspect authentication state.
2. Inspect route protection.
3. Inspect onboarding completion.
4. Inspect saved preferences.
5. Inspect price integration.
6. Inspect news integration.
7. Inspect daily insight service.
8. Inspect meme data.
9. Inspect feedback API and components.
10. Inspect dashboard routes and schemas.
11. Inspect design-system components.
12. Inspect responsive styling.
13. Inspect tests.
14. Inspect current uncommitted changes.

Do not overwrite unrelated user work.

### Step 2: Explain the implementation

Before writing code, explain:

- How the dashboard obtains its data.
- Whether it uses a combined or separate API approach.
- How each section is personalized.
- What receives feedback in every section.
- How partial failures are handled.
- How the layout changes on mobile.
- Which files will change.
- How the dashboard will be tested.

### Step 3: Implement backend orchestration

When required:

1. Authenticate the user.
2. Validate onboarding completion.
3. Load preferences.
4. Call section services.
5. Preserve partial results.
6. Attach section statuses.
7. Attach stable content keys.
8. Attach current-user feedback.
9. Validate the response schema.

### Step 4: Implement dashboard API types

Define clear backend and frontend types.

Keep these values consistent:

```text
section statuses
section types
content keys
vote values
asset identifiers
```

Do not use untyped arbitrary objects for the complete dashboard response.

### Step 5: Implement reusable frontend components

Build focused components for:

- Dashboard header.
- Price section.
- News section.
- AI insight.
- Meme.
- Feedback buttons.
- Loading states.
- Empty states.
- Error states.

Reuse established UI components.

### Step 6: Implement personalization

Verify actual behavior from saved preferences.

Do not claim personalization merely because preferences are displayed.

### Step 7: Add feedback

Ensure all four sections visibly support feedback.

Load the current vote with the dashboard content.

### Step 8: Add responsive and accessible behavior

Test layout and interaction at different viewport sizes.

Use keyboard navigation.

Inspect visible focus, contrast, headings, and image alternatives.

### Step 9: Run tests

Run:

- Backend dashboard-service tests.
- API tests.
- Frontend component tests.
- Personalization tests.
- Partial-failure tests.
- Responsive visual review.
- Manual end-to-end verification.

Do not claim completion based only on static code inspection.

## Required backend tests

Test at least:

- Unauthenticated request is rejected.
- User with incomplete onboarding is handled.
- User preferences are loaded.
- Selected assets determine price results.
- Selected assets affect news.
- Investor type reaches the AI insight.
- Content preferences affect section ordering or emphasis.
- All four sections appear in the response contract.
- Price failure does not remove successful news.
- News failure uses fallback.
- AI failure uses safe fallback.
- Meme failure uses fallback.
- Feedback state belongs to the current user.
- Another user's data is not exposed.
- Secrets never appear in the response.

## Required frontend tests

Test at least:

- Dashboard requires authentication.
- Incomplete user is redirected to onboarding.
- All four section headings render.
- Price cards render normalized data.
- Positive and negative movement render correctly.
- News articles render safely.
- External news links use safe attributes.
- AI disclaimer is always visible.
- AI output is rendered as text.
- Meme has alt text.
- All four sections display feedback controls.
- Current feedback state is restored.
- Section loading states render.
- Section empty states render.
- One failed section does not hide successful sections.
- Retry behavior works.
- Mobile layout remains usable.

## Manual verification

When the application can run:

1. Register and complete onboarding.
2. Select Bitcoin and Ethereum.
3. Select HODLer.
4. Select Market News, Charts, and Fun.
5. Open the dashboard.
6. Confirm Bitcoin and Ethereum prices appear.
7. Confirm relevant news is preferred.
8. Confirm the AI insight uses HODLer-style language.
9. Confirm the financial disclaimer is visible.
10. Confirm a meme appears.
11. Confirm all four sections include feedback.
12. Submit votes and refresh.
13. Confirm votes remain selected.
14. Refresh the dashboard.
15. Confirm the daily insight does not change.
16. Confirm data requests do not loop.
17. Simulate a news failure.
18. Confirm fallback news appears.
19. Simulate a price failure.
20. Confirm the other sections remain usable.
21. Test desktop and mobile widths.
22. Navigate using only the keyboard.
23. Confirm no API key is visible in browser responses.

## Quality checklist

Before marking the dashboard complete, verify:

- [ ] The route requires authentication.
- [ ] Incomplete onboarding redirects correctly.
- [ ] All four mandatory sections exist.
- [ ] Saved preferences affect content.
- [ ] Prices match selected assets.
- [ ] News is relevant or clearly fallback.
- [ ] Daily AI insight is reused.
- [ ] Financial disclaimer is always visible.
- [ ] Meme has a stable ID and alt text.
- [ ] All four sections support feedback.
- [ ] Existing votes are displayed.
- [ ] Partial failure is supported.
- [ ] Loading states exist.
- [ ] Empty states exist.
- [ ] Error states exist.
- [ ] Layout is responsive.
- [ ] Keyboard interaction works.
- [ ] External content is rendered safely.
- [ ] No secrets appear in frontend code.
- [ ] Automated tests pass.
- [ ] Manual verification is complete when possible.

## Scope control

Do not add these features unless explicitly requested:

- Real cryptocurrency trading.
- Wallet connections.
- Portfolio balances.
- Payment processing.
- Real-time WebSocket streaming.
- Complex technical-analysis indicators.
- Full social feeds.
- User-to-user messaging.
- Large analytics dashboards.
- Multi-agent orchestration.
- Kubernetes.
- Microservices.
- Heavy animation frameworks.

Focus on a polished, personalized and reliable MVP.

## Required explanation after implementation

After completing a dashboard task, report:

1. What the dashboard displays.
2. How each section obtains its data.
3. How preferences affect the result.
4. How the daily AI insight is reused.
5. How the meme changes.
6. What receives feedback.
7. How partial failures are handled.
8. How responsive behavior works.
9. Which files changed.
10. Which tests were run.
11. Any remaining limitation.
12. Anything that could not be verified.

Explain the complete data flow in plain language.

Do not provide only a list of components or files.

## Completion criteria

The dashboard is complete only when:

- It is available only to authenticated users.
- Incomplete users are directed to onboarding.
- All four mandatory sections are visible.
- Content is genuinely personalized.
- External data is normalized.
- The same daily insight is reused.
- Meme behavior is dynamic and stable.
- Every section supports feedback.
- Existing feedback survives refresh.
- Partial failures do not break the page.
- Loading, empty, and error states exist.
- The layout works on desktop and mobile.
- The page is accessible by keyboard.
- Automated tests pass.
- The full flow has been manually verified when possible.
- The implementation is clearly explained.

If any requirement cannot be tested, mark it as `not_verified` and explain
why.

If `$ARGUMENTS` specifies a dashboard area, focus on that area while checking
its effect on authentication, personalization, data flow, feedback, failure
handling, accessibility, and responsive behavior.
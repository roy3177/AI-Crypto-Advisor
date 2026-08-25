---
name: build-user-onboarding
description: Build, review, test, or modify the onboarding and user-preference flow for the Moveo AI Crypto Advisor. Use when working on first-login routing, crypto asset selection, investor types, content preferences, preference validation, onboarding API endpoints, onboarding UI, preference updates, or onboarding tests. Inspect the existing authentication flow, user model, preference model, routes, and frontend state before making changes.
argument-hint: "[backend|frontend|preferences|routing|tests|review]"
disable-model-invocation: false
---

# Build Crypto Advisor User Onboarding

Build and maintain the first-login onboarding experience for the Moveo AI
Crypto Advisor.

The onboarding must collect and save:

1. Crypto assets that interest the user.
2. The user's investor type.
3. The content categories the user wants to see.

The saved preferences must influence the dashboard.

Do not treat onboarding as a visual form only. The answers must be validated,
stored in the database, connected to the authenticated user, and used by
later application features.

## Required user flow

```text
User registers or logs in
        ↓
Backend returns onboarding_completed
        ↓
Is onboarding completed?
        ├── No  → Navigate to /onboarding
        └── Yes → Navigate to /dashboard
```

After successful onboarding:

```text
Authenticated user submits preferences
        ↓
Backend validates the selections
        ↓
Backend saves the preferences
        ↓
Backend marks onboarding_completed = true
        ↓
Transaction commits
        ↓
Frontend updates the authenticated user
        ↓
Frontend navigates to /dashboard
```

The backend is the source of truth for onboarding completion.

Do not rely only on frontend state or browser storage.

## Required onboarding questions

### Question 1: Interested crypto assets

Ask:

```text
What crypto assets are you interested in?
```

Allow the user to select multiple assets.

Recommended initial options:

| Display name | Stored identifier |
|---|---|
| Bitcoin | `bitcoin` |
| Ethereum | `ethereum` |
| Solana | `solana` |
| Cardano | `cardano` |
| Dogecoin | `dogecoin` |

Store stable CoinGecko identifiers rather than display names or ticker symbols.

Example:

```json
[
  "bitcoin",
  "ethereum",
  "solana"
]
```

Rules:

- Require at least one asset.
- Prevent duplicate selections.
- Reject unsupported asset identifiers.
- Do not allow arbitrary user input to be forwarded directly to external APIs.
- Keep the supported-assets list in one controlled location.
- Use the same identifiers in onboarding, CoinGecko requests, and dashboard
  filtering.

### Question 2: Investor type

Ask:

```text
What type of investor are you?
```

Recommended options:

| Display name | Stored value |
|---|---|
| HODLer | `hodler` |
| Day Trader | `day_trader` |
| NFT Collector | `nft_collector` |
| Beginner | `beginner` |

Allow one investor type.

Rules:

- Require exactly one value.
- Reject unsupported values.
- Keep stored values independent from UI labels.
- Do not infer financial experience beyond the user's selection.
- Do not treat the selected type as permission to provide financial advice.

### Question 3: Content preferences

Ask:

```text
What kind of content would you like to see?
```

Recommended options:

| Display name | Stored value |
|---|---|
| Market News | `market_news` |
| Charts and Prices | `charts` |
| Social Content | `social` |
| Fun Content | `fun` |

Allow multiple selections.

Rules:

- Require at least one content type.
- Prevent duplicates.
- Reject unsupported values.
- Do not hide mandatory dashboard sections solely because the user did not
  select them.
- Use these preferences to rank, emphasize, or personalize content.

## Personalization contract

The onboarding is useful only if later features consume the saved answers.

The dashboard must use:

### Interested assets

Use selected assets to:

- Request and display relevant coin prices.
- Filter or rank relevant news.
- Provide factual context to the AI insight.
- Build stable feedback content keys for coin-price cards.

### Investor type

Use the investor type to adjust AI insight language.

Examples:

- `hodler`: Emphasize longer-term trends and avoid overreacting to daily moves.
- `day_trader`: Emphasize short-term movement and volatility without giving
  trading instructions.
- `nft_collector`: Include relevant ecosystem or NFT context when reliable
  data is available.
- `beginner`: Use simpler language and explain unfamiliar terms.

### Content preferences

Use content preferences to:

- Determine section ordering.
- Adjust visual emphasis.
- Choose suitable AI insight context.
- Improve future recommendation scoring.

All four mandatory dashboard sections must remain available:

```text
Market News
Coin Prices
AI Insight of the Day
Fun Crypto Meme
```

## Data model expectations

Use a one-to-one relationship between a user and their preference record.

Recommended fields:

```text
user_preferences
├── id
├── user_id
├── interested_assets
├── investor_type
├── content_types
├── created_at
└── updated_at
```

Required constraint:

```text
UNIQUE(user_id)
```

The `user_id` must reference the authenticated user.

Never accept another user's ID from the request body.

Recommended user field:

```text
users.onboarding_completed
```

Default value:

```text
false
```

## Recommended API endpoints

Use these routes unless the existing API follows another consistent
convention:

```text
GET /api/preferences/options
GET /api/preferences/me
PUT /api/preferences/me
```

Possible onboarding-specific alternative:

```text
POST /api/onboarding
```

Prefer one clear API design.

Do not create duplicate endpoints that perform the same operation.

## Options endpoint

The options endpoint may return the supported onboarding choices.

Recommended response:

```json
{
  "assets": [
    {
      "id": "bitcoin",
      "label": "Bitcoin",
      "symbol": "BTC"
    },
    {
      "id": "ethereum",
      "label": "Ethereum",
      "symbol": "ETH"
    },
    {
      "id": "solana",
      "label": "Solana",
      "symbol": "SOL"
    }
  ],
  "investor_types": [
    {
      "id": "hodler",
      "label": "HODLer"
    },
    {
      "id": "day_trader",
      "label": "Day Trader"
    },
    {
      "id": "nft_collector",
      "label": "NFT Collector"
    },
    {
      "id": "beginner",
      "label": "Beginner"
    }
  ],
  "content_types": [
    {
      "id": "market_news",
      "label": "Market News"
    },
    {
      "id": "charts",
      "label": "Charts and Prices"
    },
    {
      "id": "social",
      "label": "Social Content"
    },
    {
      "id": "fun",
      "label": "Fun Content"
    }
  ]
}
```

This endpoint may be public because it contains only supported product
options.

If the options are static and shared safely between frontend and backend, an
endpoint is optional.

The backend must still validate all submitted identifiers.

## Preference request schema

Recommended shape:

```json
{
  "interested_assets": [
    "bitcoin",
    "ethereum"
  ],
  "investor_type": "hodler",
  "content_types": [
    "market_news",
    "charts",
    "fun"
  ]
}
```

Validate:

- `interested_assets` contains at least one supported unique value.
- `interested_assets` does not exceed the number of supported assets.
- `investor_type` is one supported value.
- `content_types` contains at least one supported unique value.
- No string is blank.
- No unexpected server-controlled field is accepted.

Reject requests containing:

```text
user_id
onboarding_completed
created_at
updated_at
```

These fields are controlled by the backend.

## Preference response schema

Recommended response:

```json
{
  "interested_assets": [
    "bitcoin",
    "ethereum"
  ],
  "investor_type": "hodler",
  "content_types": [
    "market_news",
    "charts",
    "fun"
  ],
  "onboarding_completed": true,
  "updated_at": "2026-08-25T17:00:00Z"
}
```

Use the actual stored values.

Do not return a success response before the transaction commits.

## Authentication requirements

Preference read and write endpoints must require authentication.

Resolve the user through the authentication dependency:

```python
current_user: User = Depends(get_current_user)
```

Use:

```text
current_user.id
```

for all database operations.

Never trust:

- A `user_id` from the request body.
- A `user_id` from a query parameter.
- A `user_id` from frontend state as proof of identity.

A user may read and modify only their own preferences.

## Atomic onboarding transaction

Saving preferences and marking onboarding complete must happen in one
transaction.

Correct behavior:

```text
Begin transaction
        ↓
Create or update UserPreference
        ↓
Set User.onboarding_completed = true
        ↓
Commit
```

If either operation fails:

```text
Rollback the entire transaction
```

Do not allow this inconsistent state:

```text
onboarding_completed = true
preferences = missing
```

Do not allow this inconsistent state:

```text
preferences = saved
onboarding_completed = false
```

## Create-or-update behavior

Use upsert-like behavior.

Expected flow:

```text
Find preferences for authenticated user
        ↓
Preferences exist?
        ├── Yes: update the existing record
        └── No: create a new record
        ↓
Mark onboarding complete
        ↓
Commit
```

The database unique constraint on `user_id` must remain the final protection
against duplicate preference rows.

Do not rely only on a preliminary `SELECT`.

## Onboarding frontend

Create a clean, short, and understandable onboarding experience.

The page should include:

- A clear title.
- A short explanation.
- Visible progress.
- Three questions.
- Selectable cards, buttons, chips, or checkboxes.
- Back and next controls when using multiple steps.
- A final submit action.
- Loading state.
- Validation messages.
- API error state.
- Responsive design.

Suggested title:

```text
Personalize your crypto dashboard
```

Suggested explanation:

```text
Tell us what interests you so we can tailor your daily crypto content.
```

## Single-page versus multi-step form

Either approach is valid.

### Recommended approach

Use a short three-step flow:

```text
Step 1: Select assets
Step 2: Select investor type
Step 3: Select content preferences
```

Advantages:

- Less visual overload.
- Clear progress.
- Easier mobile experience.
- More polished onboarding.

Do not add unnecessary animations or complex state machines.

If the existing design works better as one page, keep one page and separate
the questions visually.

## Frontend state

Keep onboarding form state in one controlled component or hook.

Example conceptual state:

```ts
type OnboardingForm = {
  interestedAssets: string[];
  investorType: string | null;
  contentTypes: string[];
};
```

Use naming conversion consistently between frontend and backend.

Example:

```text
Frontend: interestedAssets
API JSON: interested_assets
```

Use either a deliberate mapping layer or a shared convention.

Do not mix both naming styles unpredictably.

## Navigation rules

### User has not completed onboarding

Allow:

```text
/onboarding
```

Redirect protected dashboard access:

```text
/dashboard → /onboarding
```

### User has completed onboarding

Allow:

```text
/dashboard
```

If the user opens `/onboarding`, choose one deliberate behavior:

- Redirect to `/dashboard`, or
- Allow preference editing using the same form.

Recommended MVP behavior:

- Use `/onboarding` for first-time setup.
- Provide a separate `/settings/preferences` page for later editing.

If a separate settings page is outside the available time, safely reuse the
form and change its title and submit button.

## Authentication-state update

After successful onboarding, update the frontend authentication state.

Incorrect flow:

```text
Save preferences
        ↓
Navigate immediately
        ↓
Auth state still says onboarding_completed = false
        ↓
Route guard redirects back to onboarding
```

Correct flow:

```text
Save preferences
        ↓
Update or reload current user
        ↓
Confirm onboarding_completed = true
        ↓
Navigate to dashboard
```

Use the response from the backend or call `/api/auth/me` again.

Prevent redirect loops.

## Loading behavior

Show a loading state while:

- Restoring authentication.
- Loading existing preferences.
- Loading supported options when received from the backend.
- Saving onboarding answers.

Disable repeated submission while a save is in progress.

Do not create duplicate requests when the user clicks the submit button more
than once.

## Validation behavior

Validate in both places:

```text
Frontend validation → Immediate user experience
Backend validation  → Actual security and data integrity
```

Frontend validation must not replace backend validation.

Display helpful messages such as:

```text
Select at least one crypto asset.
Choose the investor type that best describes you.
Select at least one content category.
```

Do not show raw backend stack traces or database errors.

## Existing-preference behavior

When a user already has preferences:

1. Load the saved values.
2. Preselect the current choices.
3. Allow deliberate updates.
4. Save changes to the existing record.
5. Preserve the one-record-per-user rule.

Do not reset unmodified fields accidentally.

For partial update endpoints, distinguish between:

- A missing field.
- An explicitly empty field.

For the initial MVP, a complete `PUT` request is simpler and recommended.

## External API separation

The onboarding form must not call CoinGecko directly just to validate
submitted assets.

Keep a controlled supported-assets catalog in the application.

The catalog may contain:

```json
{
  "id": "bitcoin",
  "symbol": "BTC",
  "label": "Bitcoin",
  "image": "optional-local-or-trusted-url"
}
```

The integration layer will later use `id` for CoinGecko requests.

This separation prevents unsupported or arbitrary asset values from entering
the system.

## Accessibility requirements

Ensure that:

- Every input has an accessible label.
- Selection does not depend only on color.
- Keyboard users can select options.
- Focus states are visible.
- Validation errors are connected to the relevant question.
- Buttons have clear text.
- Progress information is understandable.
- The page remains usable on mobile screens.

Do not use clickable non-semantic elements without keyboard support.

## Error handling

Handle at least:

| Situation | Expected behavior |
|---|---|
| User is unauthenticated | Return `401` and navigate to login |
| No asset selected | Return validation error |
| Unsupported asset | Return validation error |
| No investor type | Return validation error |
| Unsupported investor type | Return validation error |
| No content type | Return validation error |
| Duplicate options | Normalize or reject consistently |
| Database unavailable | Return a controlled service error |
| Save fails | Keep form selections and show retry message |
| Repeated submit | Prevent duplicate requests |

Do not mark onboarding as complete after a failed save.

## Implementation workflow

### Step 1: Inspect the existing project

Before making changes:

1. Inspect the user model.
2. Inspect the user-preference model.
3. Inspect database migrations.
4. Inspect authentication endpoints.
5. Inspect `get_current_user`.
6. Inspect current-user response schemas.
7. Inspect frontend authentication state.
8. Inspect route guards.
9. Inspect existing form components.
10. Inspect styling conventions.
11. Inspect API client behavior.
12. Inspect relevant tests.
13. Inspect current uncommitted changes.

Do not overwrite unrelated user work.

### Step 2: Explain the implementation

Before writing code, explain:

- What information will be collected.
- How each value will be stored.
- Why CoinGecko identifiers are used.
- How the authenticated user is identified.
- How the transaction prevents inconsistent data.
- How frontend routing will change.
- Which files will be created or modified.
- How the flow will be tested.

Keep the explanation concise and in plain language.

### Step 3: Implement backend models and migrations

When not already implemented:

1. Add the preference model.
2. Add the one-to-one user relationship.
3. Add the unique `user_id` constraint.
4. Add required fields.
5. Add timestamps.
6. Create an Alembic migration.
7. Review the generated migration.
8. Apply it to a disposable development database.
9. Test rollback when practical.

Do not modify the production database directly.

### Step 4: Implement backend validation

Create controlled values for:

- Supported assets.
- Investor types.
- Content types.

Use Pydantic validation for request shape.

Use database constraints for important persistent rules.

Do not rely on TypeScript types for backend security.

### Step 5: Implement onboarding service

Create a focused service operation that:

1. Receives the authenticated user.
2. Receives validated preferences.
3. Finds the user's existing preference record.
4. Creates or updates it.
5. Marks onboarding complete.
6. Commits once.
7. Rolls back on failure.
8. Returns saved data.

Keep database logic out of frontend code.

Keep route handlers thin when the project uses a service layer.

### Step 6: Implement API endpoints

Implement:

```text
GET /api/preferences/me
PUT /api/preferences/me
```

Optionally implement:

```text
GET /api/preferences/options
```

Protect user-specific endpoints with authentication.

### Step 7: Implement onboarding UI

Implement:

- Question components.
- Selection state.
- Progress state.
- Validation.
- Submit logic.
- Loading state.
- Error handling.
- Successful state update.
- Dashboard navigation.
- Responsive behavior.
- Accessible interaction.

Reuse existing design-system components when available.

### Step 8: Connect onboarding to authentication

Ensure:

- New users are directed to onboarding.
- Existing completed users are directed to the dashboard.
- Successful onboarding updates auth state.
- Refreshing the page preserves the correct route.
- Users cannot access another user's preferences.

### Step 9: Run tests

Run:

- Backend unit tests.
- Backend API tests.
- Frontend component tests.
- Route-guard tests.
- End-to-end onboarding verification when the application can run.

Do not claim completion based only on static inspection.

## Required backend tests

Test at least:

### Authentication

- Unauthenticated user cannot read preferences.
- Unauthenticated user cannot save preferences.
- Authenticated user is resolved from the JWT.
- Submitted `user_id` cannot change ownership.

### Validation

- Valid selections are accepted.
- Empty asset list is rejected.
- Unsupported asset is rejected.
- Duplicate assets are handled consistently.
- Missing investor type is rejected.
- Unsupported investor type is rejected.
- Empty content list is rejected.
- Unsupported content type is rejected.

### Persistence

- First submission creates preferences.
- First submission marks onboarding complete.
- Preferences and onboarding status commit together.
- Failed preference save does not mark onboarding complete.
- Second submission updates the existing row.
- Second submission does not create a duplicate row.
- One user's update does not affect another user.
- Timestamps behave correctly.

## Required frontend tests

Test at least:

- The first question displays supported assets.
- Multiple assets can be selected.
- Investor type allows one selection.
- Multiple content types can be selected.
- The user cannot advance with an invalid answer.
- Existing answers are loaded when editing.
- Submit button is disabled while saving.
- Successful save updates authentication state.
- Successful save navigates to the dashboard.
- Failed save preserves selected answers.
- Failed save displays a helpful error.
- An unauthenticated user is redirected to login.
- A completed user does not enter an onboarding redirect loop.

## Manual verification

When the application can run, verify:

1. Register a new user.
2. Confirm `onboarding_completed` is `false`.
3. Confirm the frontend opens `/onboarding`.
4. Try continuing without selecting an asset.
5. Confirm validation is displayed.
6. Select Bitcoin and Ethereum.
7. Select HODLer.
8. Select Market News, Charts, and Fun.
9. Submit the form.
10. Confirm one preference row is stored.
11. Confirm the row belongs to the authenticated user.
12. Confirm `onboarding_completed` is now `true`.
13. Confirm the frontend navigates to `/dashboard`.
14. Refresh the browser.
15. Confirm the user remains on the correct route.
16. Edit the preferences.
17. Confirm the same database row is updated.
18. Confirm no duplicate preference row is created.
19. Log in with a different user.
20. Confirm the second user cannot read the first user's preferences.

## Security checklist

Before marking onboarding complete, verify:

- [ ] Preference endpoints require authentication.
- [ ] User identity comes from the verified token.
- [ ] Request bodies cannot select another `user_id`.
- [ ] Supported values are validated by the backend.
- [ ] One preference row exists per user.
- [ ] Saving preferences and completing onboarding are atomic.
- [ ] Database failures roll back the transaction.
- [ ] Raw database errors are not returned.
- [ ] External API calls do not use arbitrary user-supplied identifiers.
- [ ] No secrets appear in frontend code.
- [ ] No unrelated user data is returned.

## Scope control

Do not add these features unless explicitly requested:

- A long financial-risk questionnaire.
- Real identity verification.
- Know Your Customer checks.
- Portfolio balance collection.
- Wallet addresses.
- Trading history.
- Income or net-worth questions.
- Automated investment recommendations.
- Complex recommendation-model training.
- Social profiles.
- Onboarding gamification that delays the MVP.

The assignment requires a short personalization quiz.

Keep the experience fast, clear, and polished.

## Required explanation after implementation

After completing an onboarding task, report:

1. What was implemented.
2. Which questions are collected.
3. How each answer is stored.
4. How the authenticated user is identified.
5. How the database transaction works.
6. How onboarding affects navigation.
7. How preferences will affect the dashboard.
8. Which files changed.
9. Which tests were run.
10. Any remaining risk.
11. Anything that could not be verified.

Explain technical concepts in plain language.

Do not provide only a list of changed files.

## Completion criteria

Onboarding is complete only when:

- New users are directed to onboarding.
- All three required questions are displayed.
- At least one asset is required.
- Exactly one investor type is required.
- At least one content type is required.
- The backend validates every submitted value.
- Preferences are connected to the authenticated user.
- One preference record exists per user.
- Preferences and onboarding completion are saved atomically.
- Existing preferences can be updated safely.
- Authentication state is updated after completion.
- The user reaches the dashboard without a redirect loop.
- Preferences are available for dashboard personalization.
- Automated tests pass.
- The complete flow has been manually verified when possible.
- The implementation is clearly explained.

If any requirement cannot be tested, mark it as `not_verified` and explain
why.

If `$ARGUMENTS` specifies an onboarding area, focus on that area while
checking its effect on authentication, persistence, routing, and dashboard
personalization.
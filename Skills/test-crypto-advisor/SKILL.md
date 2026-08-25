---
name: test-crypto-advisor
description: Test, verify, diagnose, or review the Moveo AI Crypto Advisor across backend, frontend, database, external integrations, authentication, onboarding, dashboard, AI insights, feedback, and complete user flows. Use when adding tests, investigating failures, validating a feature, preparing deployment, checking assignment requirements, or performing final quality assurance. Inspect the existing implementation and test configuration before creating or changing tests.
argument-hint: "[unit|backend|frontend|integration|e2e|security|coverage|all]"
disable-model-invocation: false
---

# Test the Moveo AI Crypto Advisor

Test and verify the Moveo AI Crypto Advisor systematically.

Do not treat successful compilation as proof that the application works.

Do not treat passing unit tests as proof that the complete user flow works.

Use multiple verification levels:

1. Static checks.
2. Unit tests.
3. Database tests.
4. Backend API tests.
5. Frontend component tests.
6. Integration tests.
7. End-to-end tests.
8. Manual visual and behavioral verification.
9. Deployment smoke tests.

## Testing objectives

Verify that:

- Users can register and log in.
- Passwords are securely hashed.
- JWT authentication protects private data.
- New users complete onboarding.
- Preferences are stored correctly.
- Preferences affect dashboard content.
- Coin prices are retrieved and normalized.
- News is retrieved or replaced by fallback content.
- Daily AI insights are grounded, stored, and reused.
- Crypto memes display correctly.
- Every section supports feedback.
- Feedback is stored without duplicate rows.
- Partial external-service failures do not break the dashboard.
- The UI works on desktop and mobile.
- No secrets or private data are exposed.
- The deployed application works publicly.

## Testing principles

### Test behavior, not implementation details

Prefer:

```text
Given valid signup data
When the signup endpoint is called
Then a user is created and no password hash is exposed
```

Avoid tests that only assert private function call order without verifying
useful behavior.

### Keep tests deterministic

Tests must not depend on:

- Current live coin prices.
- Current live news.
- A live AI model response.
- Random meme selection without controlling randomness.
- The current wall-clock date without controlling time.
- Shared production data.

Mock or fake unstable dependencies.

### Protect test isolation

Every test must:

- Start from a known state.
- Create only the data it needs.
- Avoid relying on test execution order.
- Clean up or roll back database changes.
- Avoid modifying production resources.

### Match real behavior

Use unit tests for focused logic, but also test:

- Real validation.
- Real database constraints.
- Real API routes.
- Real frontend state changes.
- Complete user workflows.

## Recommended test structure

Adapt to the existing project.

Example backend structure:

```text
backend/tests/
├── conftest.py
├── unit/
│   ├── test_security.py
│   ├── test_prompt_builder.py
│   ├── test_content_keys.py
│   └── test_personalization.py
├── api/
│   ├── test_auth.py
│   ├── test_preferences.py
│   ├── test_market.py
│   ├── test_insights.py
│   ├── test_feedback.py
│   └── test_dashboard.py
├── services/
│   ├── test_market_service.py
│   ├── test_insight_service.py
│   └── test_feedback_service.py
└── integration/
    ├── test_onboarding_flow.py
    └── test_dashboard_flow.py
```

Example frontend structure:

```text
frontend/src/
├── components/
│   └── **/*.test.tsx
├── pages/
│   └── **/*.test.tsx
└── test/
    ├── setup.ts
    ├── handlers.ts
    └── server.ts
```

Example end-to-end structure:

```text
e2e/
├── auth.spec.ts
├── onboarding.spec.ts
├── dashboard.spec.ts
└── feedback.spec.ts
```

Do not reorganize established tests only to match this example.

## Preferred tools

Use tools already present in the repository.

For a new implementation, prefer:

### Backend

```text
pytest
FastAPI TestClient or HTTPX AsyncClient
pytest-asyncio when required
```

### Frontend

```text
Vitest
React Testing Library
user-event
Mock Service Worker
```

### End-to-end

```text
Playwright
```

Do not install multiple equivalent testing frameworks.

Inspect package versions and current project configuration before writing
tests.

## Test environment

Create a separate test configuration.

Test configuration must not use:

- Production database.
- Production API keys.
- Production AI keys.
- Production JWT secrets.
- Real user data.

Use environment values such as:

```env
ENVIRONMENT=test
DATABASE_URL=<test-database-url>
JWT_SECRET_KEY=test-only-secret
AI_PROVIDER=fake
```

Do not commit a real database credential.

## Database strategy

Prefer one of:

1. A disposable PostgreSQL test database.
2. A PostgreSQL container created for tests.
3. Transaction-based isolation around each test.

SQLite may behave differently from PostgreSQL in:

- JSONB.
- Enum handling.
- Constraints.
- Concurrency.
- SQL syntax.
- Migration behavior.

If the production application uses PostgreSQL, include meaningful tests
against PostgreSQL before final delivery.

Do not claim PostgreSQL compatibility based only on SQLite tests.

## Test fixtures

Create reusable fixtures for:

- Database session.
- API client.
- Registered user.
- Authenticated user.
- JWT headers.
- Completed-onboarding user.
- User preferences.
- Daily insight.
- Feedback record.
- Mock CoinGecko response.
- Mock news response.
- Mock AI response.
- Meme data.

Fixtures must remain small and understandable.

Avoid one global fixture that creates the entire application state for every
test.

## Time control

Control time in tests that depend on:

- JWT expiration.
- Daily insight dates.
- Price snapshot dates.
- News timestamps.
- Cache expiration.

Do not make tests fail depending on the hour or local timezone.

Use a fixed test date where appropriate:

```text
2026-08-25
```

Test both sides of important date boundaries.

## Randomness control

Control random behavior for:

- Meme selection.
- Generated identifiers where exact values matter.
- Randomized fallback selection.

Use:

- Dependency injection.
- Seeded randomness.
- A deterministic selector in tests.

Do not write flaky tests that expect one random meme without controlling the
choice.

## External-service mocking

Automated tests must not depend on live services.

Mock:

- CoinGecko.
- CryptoPanic or selected news provider.
- OpenRouter or Hugging Face.
- External meme URLs when necessary.

Test these provider outcomes:

```text
Success
Timeout
Rate limit
Unauthorized
Malformed JSON
Unexpected response schema
Empty response
5xx failure
```

Verify application behavior, not only that an exception was raised.

## Static checks

Run applicable repository checks.

### Backend

Possible checks:

```text
Ruff
Black check
Mypy
Pyright
```

Use only configured tools.

### Frontend

Possible checks:

```text
ESLint
TypeScript type checking
Prettier check
```

Do not add every tool if the project already has a clear quality setup.

Report the exact command and outcome.

## Authentication tests

Test:

### Signup

- Valid signup succeeds.
- User is stored.
- Email is normalized.
- Duplicate email is rejected.
- Invalid email is rejected.
- Blank name is rejected.
- Weak password is rejected according to policy.
- Password is stored as a hash.
- Plaintext password is not stored.
- Response excludes password data.
- New user has incomplete onboarding.

### Login

- Valid login succeeds.
- Valid token is returned.
- Incorrect password is rejected.
- Unknown email is rejected.
- Error does not reveal which credential was wrong.
- Inactive user is rejected.

### JWT

- Valid token is accepted.
- Missing token is rejected.
- Invalid signature is rejected.
- Expired token is rejected.
- Token without subject is rejected.
- Token with wrong type is rejected.
- Missing user is rejected.
- Inactive user is rejected.

### Authorization

- Authenticated user accesses private data.
- Unauthenticated user cannot access private data.
- One user cannot read another user's private data.
- One user cannot modify another user's preferences.
- One user cannot vote on another user's private insight.

## Onboarding tests

Test:

- New user is directed to onboarding.
- Completed user is directed to the dashboard.
- Valid answers are accepted.
- At least one crypto asset is required.
- Unsupported assets are rejected.
- Exactly one valid investor type is required.
- At least one content type is required.
- Unsupported content types are rejected.
- Duplicate selections are handled.
- Preferences belong to the authenticated user.
- One preference record exists per user.
- Repeated submission updates the existing record.
- Preferences and onboarding completion commit together.
- Failed preference save does not mark onboarding complete.
- Auth state updates after successful completion.
- No redirect loop occurs.

## Coin-price tests

Test:

- Only selected assets are requested.
- Supported asset identifiers map correctly.
- Provider data is normalized.
- Positive change is preserved.
- Negative change is preserved.
- Zero is preserved.
- Missing optional values are handled.
- Missing selected asset is handled.
- Timeout is handled.
- Rate limit is handled.
- Invalid JSON is handled.
- Unexpected provider structure is handled.
- Fresh cache prevents unnecessary calls.
- Stale data is labeled.
- Excessively stale data is not presented as live.

## News tests

Test:

- Valid articles are normalized.
- Selected assets influence results.
- Missing optional fields are handled.
- Duplicate articles are removed.
- Unsafe URL schemes are rejected.
- External HTML is not rendered.
- Timeout activates fallback.
- Rate limit activates fallback.
- Missing key activates fallback when intended.
- Fallback is labeled.
- Fallback is not presented as current breaking news.
- Article ordering is deterministic.

## AI insight tests

Test:

- Existing daily insight is reused.
- Existing insight avoids another provider call.
- Different users receive separate insights.
- Selected assets enter the prompt context.
- Investor type affects prompt instructions.
- Available prices enter the context.
- Available news enters the context.
- External news is marked as untrusted.
- Secrets do not enter the prompt.
- Valid model output is stored.
- Blank output is rejected.
- Malformed output activates fallback.
- Timeout activates fallback.
- Rate limit activates fallback.
- Unsupported model is handled.
- Daily uniqueness is enforced.
- Concurrent creation does not store duplicates.
- Fixed disclaimer is always returned.
- Temporary fallback is not mislabeled as generated AI content.
- Generated HTML is not rendered.

## Meme tests

Test:

- A valid meme is returned.
- Meme has a stable ID.
- Meme has alt text.
- Random selection is controllable in tests.
- Missing image is handled.
- Empty meme data activates fallback.
- Refresh behavior follows the selected product rule.
- Normal component rerender does not constantly change the meme.
- Feedback targets the displayed meme ID.

## Feedback tests

Test:

- Vote `1` is accepted.
- Vote `-1` is accepted.
- Other values are rejected.
- Supported section types are accepted.
- Unsupported section types are rejected.
- Content-key format is validated.
- First vote creates one row.
- Same vote does not create a duplicate.
- Changing the vote updates the existing row.
- Composite uniqueness is enforced.
- Different users can vote on the same content.
- Current vote appears after refresh.
- Unauthenticated voting is rejected.
- Another user's private content cannot be rated.
- Failed frontend submission restores the previous visual state.
- All four dashboard sections display feedback controls.

## Dashboard tests

Test:

- Dashboard requires authentication.
- Incomplete user is directed to onboarding.
- All four required sections are returned.
- All four required sections are rendered.
- Preferences affect price results.
- Preferences affect news.
- Investor type affects insight style.
- Content preferences affect section order or emphasis.
- One section failure does not remove successful sections.
- News fallback appears when needed.
- Price stale state appears when needed.
- AI fallback appears when needed.
- Meme fallback appears when needed.
- Current-user feedback is attached.
- Another user's feedback is not attached.
- Loading states render.
- Empty states render.
- Error states render.
- Retry behavior works.
- Data fetching does not enter an infinite loop.

## End-to-end scenarios

### Scenario 1: New user journey

```text
Open application
    → Signup
    → Automatic or manual login
    → Onboarding
    → Select assets
    → Select investor type
    → Select content preferences
    → Submit
    → Dashboard
    → See four sections
    → Vote on content
    → Refresh
    → Vote remains selected
```

Verify the database at important points.

### Scenario 2: Returning user

```text
Login
    → onboarding_completed is true
    → Dashboard opens directly
    → Existing preferences are applied
    → Existing daily insight is reused
    → Existing feedback is displayed
```

### Scenario 3: External-service failure

```text
Log in
    → Open dashboard
    → News provider fails
    → Fallback news appears
    → Prices, insight, and meme remain available
```

Repeat for other independent services.

### Scenario 4: Expired authentication

```text
Open protected page with expired token
    → Backend returns 401
    → Frontend clears authentication state
    → User returns to login
    → No redirect loop
```

### Scenario 5: Cross-user isolation

```text
User A creates preferences, insight, and feedback
    → User B logs in
    → User B cannot read or modify User A's private data
```

## API contract tests

Verify that:

- Request schemas reject invalid input.
- Response schemas exclude private fields.
- Status codes are consistent.
- Date formats are consistent.
- Section types are consistent.
- Vote values are consistent.
- Content keys are stable.
- Error response shape is consistent.
- OpenAPI documentation matches implemented endpoints.

Do not rely only on manually reading Swagger.

## Migration tests

Verify:

1. An empty PostgreSQL database can apply all migrations.
2. Expected tables are created.
3. Foreign keys exist.
4. Unique constraints exist.
5. Vote check constraint exists.
6. One daily insight per user and date is enforced.
7. One preference row per user is enforced.
8. Latest migration can roll back when safe.
9. Latest migration can be applied again.

Never perform destructive migration testing against production.

## Frontend visual verification

Inspect the rendered application at:

- Mobile width.
- Tablet width.
- Desktop width.

Check:

- No horizontal overflow.
- No clipped text.
- Cards align correctly.
- Long headlines wrap correctly.
- Prices remain readable.
- Meme aspect ratio is preserved.
- Loading skeletons fit final layout.
- Error messages do not break cards.
- Feedback buttons remain accessible.
- Focus states are visible.
- Contrast is sufficient.
- External images do not cause major layout shifts.

Automated DOM tests are not a replacement for visual inspection.

## Accessibility checks

Verify:

- Semantic headings.
- Form labels.
- Keyboard navigation.
- Visible focus.
- Meaningful image alt text.
- Feedback selection state.
- Error association with inputs.
- Loading indication.
- Link descriptions.
- Status not represented only by color.

Use an automated accessibility tool when already available, but also perform
basic manual keyboard testing.

## Security tests

Test or verify:

- No plaintext passwords are stored.
- No passwords appear in logs.
- JWT secret is not committed.
- Provider keys are not committed.
- Provider keys are not returned to the frontend.
- Invalid JWTs are rejected.
- Cross-user access is rejected.
- External HTML is not rendered.
- External URL schemes are validated.
- User-provided IDs do not control ownership.
- CORS permits only expected production origins.
- Raw stack traces are not returned.
- Rate limiting is documented if not implemented.
- Dependency vulnerabilities are reviewed using configured tooling.

Do not run destructive or intrusive security testing against production.

## Coverage

Coverage is useful but not the only goal.

Prioritize:

- Authentication.
- Authorization.
- Database constraints.
- Personalization logic.
- Provider failure handling.
- Daily insight reuse.
- Feedback upsert logic.
- Route guards.
- Complete user journeys.

Do not add meaningless tests solely to increase a percentage.

If the project defines a coverage threshold, enforce it consistently.

Otherwise, report coverage as information rather than inventing a requirement.

## Test execution workflow

### Step 1: Inspect configuration

Before changing tests:

1. Inspect backend dependencies.
2. Inspect frontend dependencies.
3. Inspect test scripts.
4. Inspect test configuration.
5. Inspect existing fixtures.
6. Inspect database setup.
7. Inspect CI configuration.
8. Inspect current failures.
9. Inspect current uncommitted changes.

Do not overwrite unrelated user work.

### Step 2: Build a requirement matrix

Map each Moveo requirement to:

- Implementation location.
- Test location.
- Current status.
- Missing verification.

Use statuses:

```text
passed
failed
not_implemented
not_run
blocked
not_verified
```

### Step 3: Run narrow tests first

When working on a feature:

1. Run its smallest relevant test.
2. Fix the immediate failure.
3. Run the feature test file.
4. Run related integration tests.
5. Run the full relevant suite.

Avoid repeatedly running every test after each tiny change when a narrow test
provides faster feedback.

### Step 4: Diagnose failures

For every failure:

1. Read the complete error.
2. Identify whether the failure is in code, test, configuration, or
   environment.
3. Reproduce it with the smallest relevant command.
4. Fix the root cause.
5. Rerun the failing test.
6. Run related tests for regressions.

Do not weaken a correct test merely to make it pass.

Do not delete coverage of required behavior.

### Step 5: Run full checks

Before final delivery, run:

- Backend tests.
- Frontend tests.
- Type checking.
- Linting.
- Production builds.
- Migration verification.
- End-to-end tests.
- Manual responsive review.
- Deployment smoke tests.

## Failure-reporting format

When a test fails, report:

```text
Test:
Expected:
Actual:
Likely cause:
Evidence:
Proposed fix:
Verification command:
```

Distinguish:

- Confirmed cause.
- Likely cause.
- Unknown cause.

Do not claim certainty without evidence.

## Final test report

Return a summary similar to:

| Area | Status | Evidence |
|---|---|---|
| Authentication | Passed | Backend auth tests |
| Onboarding | Passed | API and frontend tests |
| Prices | Passed | Mocked provider tests |
| News fallback | Passed | Timeout scenario |
| AI insight | Passed | Persistence and fallback tests |
| Meme | Passed | Component and fallback tests |
| Feedback | Passed | Upsert and UI tests |
| Dashboard | Passed | Integration and E2E tests |
| Deployment | Not verified | Deployment not available |

Include exact commands and meaningful results.

Do not report “all tests passed” without showing what was run.

## Completion criteria

Testing is complete only when:

- Every mandatory requirement appears in the test matrix.
- Backend tests pass.
- Frontend tests pass.
- Database constraints are tested.
- External services are mocked.
- Provider failures are tested.
- Daily insight reuse is tested.
- Cross-user isolation is tested.
- Feedback upsert behavior is tested.
- All four sections are tested.
- The production frontend build succeeds.
- The production backend starts successfully.
- End-to-end critical flow passes when the environment supports it.
- Responsive layout is visually reviewed.
- Anything not tested is labeled `not_verified`.

If `$ARGUMENTS` specifies a test area, focus on that area while checking
directly related integration and regression risks.
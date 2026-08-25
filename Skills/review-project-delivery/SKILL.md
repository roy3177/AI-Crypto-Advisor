---
name: review-project-delivery
description: Perform the final delivery review for the Moveo AI Crypto Advisor coding assignment. Use before submission, after deployment, when checking missing requirements, validating public links, reviewing repository quality, confirming database access, verifying AI usage documentation, creating a delivery checklist, or deciding whether the project is ready to submit. Inspect the original assignment, complete repository, tests, deployment configuration, public application, API, database-review method, README, and AI_USAGE.md before reporting readiness.
argument-hint: "[requirements|repository|deployment|security|documentation|all]"
disable-model-invocation: false
---

# Review the Moveo Project Delivery

Perform an evidence-based final review of the Moveo AI Crypto Advisor.

The purpose of this skill is to determine whether the project is genuinely
ready for submission.

Do not implement large new features while performing the initial review.

First:

1. Inspect the project.
2. Run safe verification.
3. Identify missing or failed requirements.
4. Present findings.
5. Recommend the smallest necessary fixes.

Implement fixes only when the user explicitly asks to proceed.

## Sources of truth

Use these sources in order:

1. The original Moveo assignment.
2. The actual repository.
3. Automated test results.
4. The deployed application.
5. The deployed backend API.
6. Database persistence evidence.
7. Project documentation.
8. User-confirmed information.

Do not treat:

- Plans.
- Skills.
- TODO comments.
- README claims.
- Passing builds alone.

as proof that a feature works.

A Skill describes intended behavior. It does not prove implementation.

## Original assignment requirements

The project must provide:

### Authentication

- Registration with email, name, and password.
- Login with basic authentication.
- JWT or session-based authentication.

### Onboarding

After the first login, ask:

- Which crypto assets interest the user?
- What type of investor is the user?
- What content does the user want to see?

Save the answers as user preferences in the database.

### Daily dashboard

Display:

1. Market News.
2. Coin Prices.
3. AI Insight of the Day.
4. Fun Crypto Meme.

The displayed content must be based on user preferences.

### Feedback

- Every dashboard section must include voting.
- Voting must support thumbs up and thumbs down.
- Feedback must be stored in the database.
- Data should be suitable for future recommendation improvements.

### Technical expectations

- Frontend uses React or Angular.
- Backend may use any suitable language or framework.
- Database uses SQLite, PostgreSQL, or MongoDB.
- External APIs and AI tools use free or free-tier services.
- UX is clean.
- Code is readable.
- Project structure is clear.

### Deployment

- Application is publicly deployed.
- Public URL works.
- Frontend communicates with deployed backend.
- Data remains persistent.

### Deliverables

- Public GitHub repository.
- Deployed application URL.
- Summary of AI-tool interactions.
- Access to database data through a safe review method.

### Bonus

Provide a proposed future process explaining:

- How feedback is stored.
- How it could be prepared for training or recommendation improvement.
- How a future model could be evaluated.

The bonus does not require training a model.

## Review status values

Use only these values:

```text
passed
failed
not_verified
not_applicable
blocked
```

Meanings:

### `passed`

Direct evidence confirms the requirement works.

### `failed`

The requirement was tested and did not work.

### `not_verified`

The implementation may exist, but sufficient execution evidence is missing.

### `not_applicable`

The check does not apply to the selected architecture.

### `blocked`

Verification cannot proceed because of a specific external or environmental
blocker.

Do not use `passed` for code that was only inspected.

## Evidence rules

Acceptable evidence includes:

- Successful automated test.
- Successful API response.
- Database constraint verification.
- Migration execution.
- Public browser verification.
- Public endpoint verification.
- Rendered UI inspection.
- Repository file inspection for documentation-only requirements.
- Safe database persistence check.

For every important status, cite:

- Relevant file.
- Test command.
- Endpoint.
- Public URL.
- Observed result.

Do not expose secrets while reporting evidence.

## Required review sequence

Perform the review in this order:

1. Original requirement mapping.
2. Repository health.
3. Configuration and secrets.
4. Database and migrations.
5. Authentication.
6. Onboarding.
7. External integrations.
8. AI insight.
9. Meme.
10. Feedback.
11. Dashboard.
12. Frontend quality.
13. Automated tests.
14. Deployment.
15. Persistence.
16. Documentation.
17. Deliverables.
18. Bonus proposal.
19. Final readiness decision.

## Step 1: Inspect the assignment

Read the original task document when available.

Extract:

- Mandatory features.
- Technical constraints.
- Deployment requirements.
- Deliverables.
- Bonus requirements.

Compare the current review checklist with the original document.

Do not rely only on a previous summary when the original file is available.

## Step 2: Inspect repository health

Check:

- Repository structure.
- Frontend location.
- Backend location.
- Database layer.
- Test directories.
- Project Skills.
- Documentation.
- Deployment files.
- Git status.
- Ignored files.
- Accidentally committed generated files.
- Large unnecessary files.
- Debug code.
- TODO and FIXME comments.

Do not modify unrelated user work.

Flag:

- Empty placeholder files.
- Dead code.
- Commented-out large code blocks.
- Duplicate implementations.
- Hardcoded development URLs.
- Hardcoded credentials.
- Unused dependencies when clearly identifiable.
- Missing setup instructions.

## Step 3: Check repository cleanliness

Verify:

- `.gitignore` exists.
- `.env` files containing secrets are ignored.
- Virtual environments are ignored.
- `node_modules` is ignored.
- Python cache files are ignored.
- Test output is handled deliberately.
- Build output is handled deliberately.
- IDE-specific files are handled deliberately.
- Uploaded private files are not included accidentally.

Do not delete files during review.

Report recommended cleanup separately.

## Step 4: Check configuration and secrets

Inspect configuration usage without printing secret values.

Search for patterns indicating:

- API keys.
- JWT secrets.
- Database passwords.
- Connection strings.
- Authorization tokens.
- Private keys.
- Hardcoded production credentials.

Verify:

- `.env.example` exists.
- `.env.example` contains placeholders.
- Required variables are documented.
- Frontend public variables contain no backend secrets.
- Production has no insecure default JWT secret.
- Logs do not print credentials.

If a probable real secret is found:

1. Do not reproduce it in the report.
2. Mark the security requirement as failed.
3. Identify only the affected file.
4. Recommend removing and rotating the secret.
5. Explain that deletion alone may not remove it from history.

## Step 5: Review database and migrations

Verify:

- PostgreSQL or another allowed database is configured.
- SQLAlchemy models match expected entities.
- Pydantic schemas exclude private fields.
- Alembic is configured when used.
- All migrations apply from an empty database.
- Current schema reaches the latest migration.
- Foreign keys exist.
- Unique constraints exist.
- Vote check constraint exists.
- One preference row per user is enforced.
- One insight per user and date is enforced.
- One feedback row per user, section, and content is enforced.
- Production data uses persistent storage.

Do not use `Base.metadata.create_all()` as evidence that migrations are valid.

Never run destructive migration checks against production.

## Step 6: Review authentication

Verify:

- Signup accepts name, email, and password.
- Email is normalized.
- Duplicate email is rejected.
- Password is hashed.
- Plaintext password is not stored.
- Login accepts correct credentials.
- Incorrect credentials are rejected safely.
- JWT or session expires appropriately.
- Private endpoints reject missing authentication.
- Current user is resolved by the backend.
- Password hash never appears in a response.
- Inactive users are handled when supported.
- Logout works according to the selected token strategy.
- Production CORS matches the authentication strategy.

Perform both automated and manual verification when possible.

## Step 7: Review onboarding

Verify:

- New users have incomplete onboarding.
- New users reach onboarding after first login.
- Asset question exists.
- Investor-type question exists.
- Content-preference question exists.
- At least one asset is required.
- Exactly one valid investor type is required.
- At least one content type is required.
- Values are validated by the backend.
- Preferences belong to the authenticated user.
- Saving preferences marks onboarding complete.
- Both changes commit atomically.
- Returning users reach the dashboard.
- Existing preferences can be updated safely.
- No redirect loop occurs.

## Step 8: Review external data

### Coin prices

Verify:

- CoinGecko or another approved free service is used.
- Selected assets determine requested prices.
- Provider responses are normalized.
- Timeouts exist.
- Error behavior is controlled.
- Cache behavior is documented.
- Stale data is labeled.
- Keys remain on the backend when applicable.

### News

Verify:

- CryptoPanic or another suitable free source is used.
- News is relevant to selected assets when possible.
- External text is rendered safely.
- External links are handled safely.
- Static fallback exists.
- Fallback content is labeled.
- Fallback is not presented as live breaking news.
- Provider failure does not break the dashboard.

Use current provider documentation when judging provider-specific behavior.

## Step 9: Review the AI insight

Verify:

- A free or free-tier provider is used.
- Provider key remains on the backend.
- Current model name is configurable.
- User preferences enter the prompt context.
- Market facts come from backend data.
- The model is not asked to know current prices independently.
- News is treated as untrusted input.
- Prompt-injection boundaries exist.
- Output is validated.
- Output is rendered as plain text.
- A fixed financial disclaimer is displayed.
- Direct financial advice is prohibited.
- Insight is stored.
- Same daily insight is reused.
- Unique daily constraint exists.
- Provider failure returns a safe fallback.
- Fallback is not mislabeled as AI-generated content.

## Step 10: Review meme behavior

Verify:

- Meme section exists.
- Meme data is dynamic according to a documented rule.
- Meme has a stable ID.
- Image loads publicly.
- Image has useful alt text.
- Missing image is handled.
- Fallback exists.
- Normal rerenders do not cause uncontrolled meme changes.
- Feedback targets the displayed meme.

## Step 11: Review feedback

Verify feedback for:

```text
market_news
coin_prices
ai_insight
crypto_meme
```

For every section, verify:

- Thumbs-up control exists.
- Thumbs-down control exists.
- Stable content key exists.
- User must be authenticated.
- Vote is stored.
- Current vote appears after refresh.
- Changing vote updates the same record.
- Duplicate rows are prevented.
- One user cannot access another user's private feedback.
- Failure does not leave false success in the UI.

## Step 12: Review personalization

Verify behavior rather than labels.

Confirm:

- Selected assets affect prices.
- Selected assets affect news.
- Investor type affects AI language.
- Content preferences affect ordering or emphasis.
- All four mandatory sections remain available.
- One user's preferences do not affect another user.

Do not mark personalization as passed merely because preferences are displayed
on screen.

## Step 13: Review dashboard quality

Verify:

- Dashboard requires authentication.
- All four sections are visible.
- Section headings are clear.
- Loading states exist.
- Empty states exist.
- Error states exist.
- Partial failures are preserved.
- Retry behavior works where appropriate.
- Price formatting is readable.
- Positive and negative movement are distinguishable without relying only on
  color.
- News cards are readable.
- AI disclaimer is visible.
- Meme maintains its aspect ratio.
- Feedback controls are clear.
- Data loading does not loop.

## Step 14: Review responsive design

Inspect at:

```text
Mobile width
Tablet width
Desktop width
```

Check:

- No horizontal overflow.
- No clipped content.
- Cards remain readable.
- Navigation remains usable.
- Forms remain usable.
- Buttons remain reachable.
- Long news headlines wrap correctly.
- Images do not dominate the page.
- Feedback buttons remain visible.
- Loading and error states fit the layout.

Do not mark responsive design as passed only because CSS media queries exist.

Inspect the rendered UI.

## Step 15: Review accessibility

Verify:

- Semantic headings.
- Form labels.
- Button semantics.
- Keyboard navigation.
- Visible focus indicators.
- Meaningful image alt text.
- Link descriptions.
- Feedback selected state.
- Errors connected to inputs.
- Status not communicated only by color.
- Reasonable contrast.
- No automatically moving essential content.

Mark automated accessibility checks and manual keyboard checks separately.

## Step 16: Run automated verification

Run configured commands for:

### Backend

- Tests.
- Linting.
- Type checking when configured.
- Migration validation.
- Application startup.

### Frontend

- Tests.
- Linting.
- Type checking.
- Production build.

### End-to-end

- Critical user journey.
- Authentication expiration.
- Provider-failure scenario.
- Feedback persistence.
- Cross-user isolation.

Run the smallest relevant checks first when diagnosing a failure.

Record exact commands and outcomes.

## Step 17: Review deployment

Verify public:

- Frontend URL.
- Backend URL.
- Health endpoint.
- API documentation when enabled.
- HTTPS.
- Production CORS.
- Direct frontend routes.
- Public signup.
- Public login.
- Onboarding.
- Dashboard.
- Feedback.
- Logout.
- Returning-user flow.

Do not mark deployment as passed from provider status alone.

Open and test the public application.

## Step 18: Review persistence

Verify:

1. Create a test user.
2. Complete onboarding.
3. Submit feedback.
4. Confirm records exist through the safe review method.
5. Restart or redeploy safely when authorized.
6. Log in again.
7. Confirm user still exists.
8. Confirm preferences still exist.
9. Confirm feedback still exists.

Do not perform disruptive production actions without authorization.

If restart verification is unavailable, mark that part `not_verified`.

## Step 19: Review README

The README should include:

- Project title.
- Short product description.
- Main features.
- Architecture summary.
- Technology stack.
- Local prerequisites.
- Backend setup.
- Frontend setup.
- Database setup.
- Environment-variable names.
- Migration commands.
- Test commands.
- Deployment links.
- API documentation link.
- Demo or reviewer instructions.
- Known limitations.
- Financial disclaimer.
- Link to `AI_USAGE.md`.

Do not include real secret values.

Verify that commands match actual repository scripts.

## Step 20: Review AI usage documentation

Verify `AI_USAGE.md` includes:

- Tools actually used.
- Main areas of assistance.
- Representative interactions.
- Suggestions accepted.
- Suggestions changed or rejected when applicable.
- Human decisions.
- Verification methods.
- Limitations.
- Final developer responsibility.
- No secrets.
- No unsupported claims.
- No remaining placeholders.

Confirm the file matches the final implementation.

## Step 21: Review database access deliverable

The assignment asks for access to the database.

Verify that one safe method is provided:

1. Protected read-only reviewer page.
2. Demo account with inspectable stored data.
3. Temporary read-only database user shared privately.
4. Documented local seeded database.

Do not accept:

- Public production database password.
- Committed connection string.
- Public unrestricted admin endpoint.
- Exposure of password hashes.
- Exposure of secrets.

Document exactly how Moveo reviewers can verify persistence.

## Step 22: Review the bonus proposal

Verify documentation explains:

```text
Feedback collection
        ↓
Data cleaning
        ↓
Feature preparation
        ↓
Rule-based baseline
        ↓
Training / validation / test split
        ↓
Ranking-model experiment
        ↓
Offline evaluation
        ↓
Controlled deployment
        ↓
Monitoring
```

The proposal should mention possible metrics:

- Positive-feedback rate.
- Click-through rate.
- Engagement.
- Recommendation diversity.
- Section-specific satisfaction.
- Performance by investor type.

It should also mention:

- Privacy.
- Anonymization.
- Bias.
- Cold-start users.
- Data quality.
- Model drift.
- Avoiding training and evaluation leakage.

Do not claim that model training has already occurred.

## Required requirement matrix

Produce a table:

| Requirement | Status | Evidence | Required action |
|---|---|---|---|
| Signup | `passed` | Test and public result | None |
| Login | `passed` | Test and public result | None |
| Onboarding | `not_verified` | Code exists only | Run public flow |
| Four dashboard sections | `failed` | Meme missing | Implement meme |
| Feedback persistence | `passed` | DB and API evidence | None |
| Public deployment | `passed` | Public URL tested | None |
| AI usage summary | `passed` | `AI_USAGE.md` | None |
| Database access | `blocked` | No reviewer method | Select safe approach |

Use real results.

Do not copy example statuses.

## Issue priorities

Classify findings as:

### Blocker

Submission requirement is missing or broken.

Examples:

- No public deployment.
- Signup or login does not work.
- Dashboard inaccessible.
- Missing mandatory section.
- Secrets committed.
- Data does not persist.

### High

Major functionality or security is unreliable.

Examples:

- Feedback not stored.
- Preferences ignored.
- Passwords stored insecurely.
- Cross-user data exposure.
- AI output invents market facts.

### Medium

Important quality problem.

Examples:

- Missing fallback.
- Weak error handling.
- Broken mobile layout.
- Missing important tests.
- Incomplete README.

### Low

Polish or optional improvement.

Examples:

- Small spacing inconsistency.
- Additional loading polish.
- Optional test coverage.
- Nonessential refactoring.

Do not classify optional bonus work as a blocker.

## Scope control

During final review, do not recommend unnecessary additions such as:

- Wallet integration.
- Real trading.
- Kubernetes.
- Microservices.
- Multi-agent systems.
- Fine-tuning implementation.
- Real-time WebSockets.
- Complex analytics.
- Paid infrastructure.

Focus on:

- Assignment compliance.
- Reliability.
- Security.
- Clean UX.
- Readable code.
- Public accessibility.
- Honest documentation.

## Final readiness decision

Use one decision:

```text
READY TO SUBMIT
```

Use only when:

- No blockers remain.
- Mandatory requirements pass.
- Public deployment is verified.
- Deliverables are present.
- Known limitations are documented.
- Anything unverified is minor and clearly disclosed.

Use:

```text
READY AFTER REQUIRED FIXES
```

when:

- A small defined set of blockers or high-priority issues remains.
- Fixes are clear and bounded.

Use:

```text
NOT READY
```

when:

- Core functionality is missing.
- Deployment is unavailable.
- Security is seriously broken.
- Verification evidence is insufficient across major areas.

Do not soften the result to be encouraging.

Provide an accurate engineering judgment.

## Required final report

Return the report in this order:

1. Readiness decision.
2. Executive summary.
3. Requirement matrix.
4. Blockers.
5. High-priority issues.
6. Medium-priority issues.
7. Low-priority improvements.
8. Security findings.
9. Test results.
10. Deployment results.
11. Deliverable status.
12. Exact required fixes.
13. Recommended submission contents.
14. Final verification checklist.

Keep evidence close to each claim.

## Submission package checklist

Confirm the submission includes:

- Public GitHub repository URL.
- Public application URL.
- Public backend or API URL when useful.
- API documentation URL when enabled.
- Reviewer or demo-account instructions.
- Safe database-access instructions.
- README.
- `AI_USAGE.md`.
- Feedback-training proposal.
- Known limitations.
- Financial disclaimer.

Do not include:

- Real `.env` files.
- Production database password.
- API keys.
- JWT secret.
- Personal access tokens.
- Private company data.
- Unnecessary ZIP files when GitHub is the requested delivery format.

## Completion criteria

The final review is complete only when:

- The original assignment was checked.
- Every mandatory requirement has a status.
- Important statuses include evidence.
- Automated checks were run when available.
- Production builds were checked.
- Migrations were verified safely.
- Public URLs were tested.
- Database persistence was assessed.
- README was reviewed.
- AI usage documentation was reviewed.
- Database access was reviewed.
- Bonus proposal was reviewed.
- Secrets were checked.
- Issues were prioritized.
- A clear readiness decision was given.
- Anything not executed is marked `not_verified`.

If `$ARGUMENTS` specifies a review area, focus on that area but still report
any directly related submission blocker.
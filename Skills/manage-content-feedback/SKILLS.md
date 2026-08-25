---
name: manage-content-feedback
description: Build, review, test, or modify thumbs-up and thumbs-down feedback for the Moveo AI Crypto Advisor. Use when working on dashboard voting, feedback database models, stable content identifiers, vote upserts, authenticated feedback endpoints, optimistic UI, duplicate-vote prevention, recommendation signals, feedback analytics, or feedback tests. Inspect the existing user authentication, dashboard content schemas, database models, migrations, routes, frontend cards, and tests before making changes.
argument-hint: "[backend|frontend|upsert|content-keys|tests|review]"
disable-model-invocation: false
---

# Manage Dashboard Content Feedback

Build and maintain thumbs-up and thumbs-down feedback for every required
dashboard section in the Moveo AI Crypto Advisor.

The feedback system must support:

1. Thumbs-up feedback.
2. Thumbs-down feedback.
3. Feedback for all four dashboard sections.
4. Feedback ownership by the authenticated user.
5. Stable identification of voted content.
6. Creation of a new vote.
7. Updating an existing vote.
8. Prevention of duplicate feedback rows.
9. Display of the current user's selected vote.
10. Storage for future recommendation improvements.

The four required dashboard sections are:

```text
market_news
coin_prices
ai_insight
crypto_meme
```

Do not build feedback as frontend-only state.

Every confirmed vote must be stored in the database.

## Feedback flow

```text
User clicks thumbs up or thumbs down
        ↓
Frontend identifies section and content
        ↓
Frontend sends section_type, content_key, and vote
        ↓
Backend authenticates the user
        ↓
Backend validates the request
        ↓
Backend creates or updates the feedback row
        ↓
Database transaction commits
        ↓
Backend returns the saved vote
        ↓
Frontend displays the confirmed state
```

## Vote values

Use these values:

```text
1  = thumbs up
-1 = thumbs down
```

Do not use multiple inconsistent representations such as:

```text
true / false
like / dislike
positive / negative
up / down
1 / 0
```

The frontend may use descriptive TypeScript types, but the API and database
representation must remain consistent.

## Database entity

Use a feedback table similar to:

```text
content_feedback
├── id
├── user_id
├── section_type
├── content_key
├── vote
├── content_snapshot
├── created_at
└── updated_at
```

Recommended field purposes:

| Field | Purpose |
|---|---|
| `id` | Feedback record identifier |
| `user_id` | Authenticated user who submitted the vote |
| `section_type` | Dashboard section being rated |
| `content_key` | Stable identifier for the specific content |
| `vote` | `1` or `-1` |
| `content_snapshot` | Optional metadata about the voted content |
| `created_at` | Time of the initial vote |
| `updated_at` | Time of the latest vote change |

## Required database constraints

Enforce:

```text
CHECK(vote IN (-1, 1))
```

Enforce one vote per user, section, and content:

```text
UNIQUE(user_id, section_type, content_key)
```

This means:

```text
Same user + same section + same content
        ↓
One feedback row
```

If the user changes from 👍 to 👎, update the existing row.

Do not create a second row.

## Feedback ownership

Resolve the user through authentication.

Use:

```python
current_user: User = Depends(get_current_user)
```

The request body must not control:

```text
user_id
```

Correct ownership:

```text
feedback.user_id = current_user.id
```

Never trust a user identifier supplied by:

- Request body.
- Query parameter.
- Frontend state.
- Content metadata.
- URL path, unless authorization is independently verified.

A user may read or modify only their own feedback.

## Section types

Allow exactly the supported section types:

```text
market_news
coin_prices
ai_insight
crypto_meme
```

Use a controlled enum or validated literal values.

Reject:

- Unknown section names.
- Blank section names.
- Arbitrary user-defined section names.
- Values with inconsistent capitalization.
- Values that do not match the dashboard contract.

Keep the same identifiers across:

- Database.
- Backend schemas.
- API.
- Frontend types.
- Tests.
- Recommendation documentation.

## Stable content keys

Every piece of votable content needs a stable `content_key`.

A content key identifies what the user voted on.

### Market news

Preferred format:

```text
news:<provider>:<article-id>
```

Example:

```text
news:cryptopanic:article-123
```

If the provider has no stable article ID, derive a deterministic identifier
from stable fields such as:

- Canonical article URL.
- Source name.
- Published timestamp.
- Normalized title.

Do not generate a random content key on every dashboard request.

### Coin prices

Preferred format:

```text
price:<asset-id>:<date-or-snapshot>
```

Example:

```text
price:bitcoin:2026-08-25
```

For the MVP, daily price-section feedback is sufficient.

If voting applies to the entire prices section rather than each coin, use:

```text
prices:<normalized-asset-list>:<date>
```

Example:

```text
prices:bitcoin,ethereum:2026-08-25
```

Choose one behavior and document it.

### AI insight

Preferred format:

```text
insight:<daily-insight-id>
```

Example:

```text
insight:8c880890-72c7-4bca-a9f4-44af82142204
```

Use the persisted daily-insight ID.

Do not create a new feedback target when the same saved insight is returned.

### Crypto meme

Preferred format:

```text
meme:<meme-id>
```

Example:

```text
meme:diamond-hands-04
```

Every meme in local JSON must have a stable unique ID.

## Content-key validation

The backend must not accept unlimited arbitrary content keys without
validation.

Validate:

- Key is not blank.
- Key has a reasonable maximum length.
- Key format matches the selected section.
- Prefix agrees with `section_type`.
- Control characters are rejected.
- User cannot insert secrets or excessive content into the key.

Examples:

```text
section_type = market_news
content_key starts with news:
```

```text
section_type = ai_insight
content_key starts with insight:
```

For persisted internal content such as an AI insight, verify that:

- The referenced record exists.
- It belongs to the authenticated user when user-specific.
- It is the content currently being rated.

For external content, validate available metadata without requiring the full
article to be persisted.

## Content snapshot

`content_snapshot` is optional metadata that helps explain what received the
vote.

Examples:

### News snapshot

```json
{
  "title": "Example Bitcoin market headline",
  "source_name": "Example Publisher",
  "related_assets": [
    "bitcoin"
  ]
}
```

### Price snapshot

```json
{
  "assets": [
    "bitcoin",
    "ethereum"
  ],
  "date": "2026-08-25"
}
```

### Insight snapshot

```json
{
  "insight_id": "insight-id",
  "insight_date": "2026-08-25",
  "investor_type": "hodler"
}
```

### Meme snapshot

```json
{
  "meme_id": "diamond-hands-04",
  "category": "fun"
}
```

Rules:

- Store only useful metadata.
- Do not store the full JWT.
- Do not store API keys.
- Do not store passwords.
- Do not trust snapshots as proof of content ownership.
- Limit snapshot size.
- Prefer server-created snapshots when reliable content is available.
- Do not store a complete external article unnecessarily.

## Recommended API endpoints

Use these endpoints unless the project has another consistent convention:

```text
PUT    /api/feedback
GET    /api/feedback/me
DELETE /api/feedback/{feedback_id}
```

The delete endpoint is optional.

A focused endpoint for reading current votes may be:

```text
GET /api/feedback/me?section_type=ai_insight&content_key=insight:123
```

Avoid creating separate voting endpoints for every dashboard section unless
the application architecture requires it.

Use one consistent feedback contract.

## Create or update request

Recommended request:

```json
{
  "section_type": "ai_insight",
  "content_key": "insight:8c880890-72c7-4bca-a9f4-44af82142204",
  "vote": 1
}
```

Do not accept:

```json
{
  "user_id": "another-user-id"
}
```

The backend resolves ownership through the authenticated request.

## Feedback response

Recommended response:

```json
{
  "id": "feedback-id",
  "section_type": "ai_insight",
  "content_key": "insight:8c880890-72c7-4bca-a9f4-44af82142204",
  "vote": 1,
  "created_at": "2026-08-25T17:10:00Z",
  "updated_at": "2026-08-25T17:10:00Z"
}
```

Do not include private user data unnecessarily.

## Upsert behavior

Implement create-or-update behavior.

Expected service flow:

```text
Authenticate user
        ↓
Validate section, key, and vote
        ↓
Find feedback by:
user_id + section_type + content_key
        ↓
Does feedback exist?
        ├── No  → Create row
        └── Yes → Update vote
        ↓
Commit
        ↓
Return saved feedback
```

Database uniqueness remains the final protection against concurrent
duplicates.

Do not rely only on:

```text
SELECT → if missing → INSERT
```

Two concurrent requests could both see no row.

Handle integrity conflicts safely.

## Same-vote behavior

If the user clicks the currently selected vote again, choose one deliberate
behavior.

### Recommended MVP behavior

Keep the existing vote unchanged.

Example:

```text
Current vote = 1
User submits 1 again
        ↓
Return the existing feedback
```

Alternative behavior:

```text
Click selected vote again → remove vote
```

This is also valid, but it requires an explicit delete behavior.

Do not implement both behaviors inconsistently.

For this project, prefer:

- Clicking 👍 sets vote to `1`.
- Clicking 👎 sets vote to `-1`.
- Clicking the already selected button keeps the current vote.
- A separate removal action is optional.

## Frontend feedback component

Create a reusable component.

Conceptual interface:

```ts
type FeedbackButtonsProps = {
  sectionType:
    | "market_news"
    | "coin_prices"
    | "ai_insight"
    | "crypto_meme";
  contentKey: string;
  initialVote: 1 | -1 | null;
  disabled?: boolean;
};
```

Responsibilities:

- Display thumbs-up.
- Display thumbs-down.
- Show the selected state.
- Submit the new vote.
- Prevent repeated requests.
- Handle failure.
- Remain accessible.
- Avoid duplicating API logic.

Use the same component across all four dashboard sections.

Do not create four unrelated voting implementations.

## Frontend states

Support:

```text
No vote
Thumbs up selected
Thumbs down selected
Saving
Save failed
Disabled
```

The selected state must not depend only on color.

Use:

- Accessible labels.
- `aria-pressed` where appropriate.
- Visible focus states.
- An icon plus a visual selected state.
- Button elements rather than non-semantic clickable elements.

Suggested labels:

```text
Helpful
Not helpful
```

or:

```text
Thumbs up
Thumbs down
```

## Optimistic UI

Optimistic UI means updating the screen before the backend response returns.

Example:

```text
User clicks 👍
        ↓
Frontend immediately highlights 👍
        ↓
Backend request runs
        ↓
Success → Keep selected state
Failure → Restore previous state
```

Optimistic UI is optional.

If implemented:

1. Save the previous vote.
2. Update UI immediately.
3. Disable or coordinate rapid repeated clicks.
4. Restore the previous vote on failure.
5. Display a small error.
6. Use the backend response as the final state.

A simpler confirmed-update approach is acceptable for the MVP.

Do not leave the UI displaying a vote that failed to save.

## Loading existing votes

The dashboard must show the current user's existing selections.

Possible approaches:

### Combined dashboard response

Include feedback state with every dashboard item:

```json
{
  "content_key": "meme:diamond-hands-04",
  "current_user_vote": 1
}
```

### Separate feedback request

Load the user's feedback for visible content:

```text
GET /api/feedback/me
```

For the MVP, a combined dashboard response is often more convenient because
it prevents many small requests.

Choose one consistent approach.

Avoid one feedback-fetch request for every individual card.

## Feedback and dashboard contracts

Every votable dashboard item should provide:

```json
{
  "section_type": "crypto_meme",
  "content_key": "meme:diamond-hands-04",
  "current_user_vote": null
}
```

The frontend should not invent content keys independently if the backend can
provide them.

Prefer backend-generated content keys to ensure consistency.

## Feedback for sections versus items

The Moveo requirement says each section includes voting.

Two interpretations are possible:

1. One vote for the entire section.
2. One vote for every content item inside the section.

Recommended MVP behavior:

| Section | Recommended feedback target |
|---|---|
| Market News | Each visible article or primary featured article |
| Coin Prices | The complete daily price section |
| AI Insight | The saved daily insight |
| Crypto Meme | The displayed meme |

Document this decision clearly.

At minimum, every section must visibly provide a way to vote.

## Error handling

Handle at least:

| Situation | Behavior |
|---|---|
| User is unauthenticated | Return `401` |
| Invalid section | Return validation error |
| Invalid content key | Return validation error |
| Invalid vote | Return validation error |
| Referenced insight missing | Return not found |
| Referenced insight belongs to another user | Return not found or forbidden safely |
| Duplicate concurrent insert | Return or update the existing row |
| Database unavailable | Roll back and return controlled error |
| Frontend save fails | Restore previous UI state and show retry message |

Do not expose raw database errors.

## Transaction rules

Every feedback mutation must use a transaction.

On success:

```text
Commit
```

On failure:

```text
Rollback
```

Do not return success before the transaction commits.

When handling a uniqueness conflict:

1. Roll back the failed insert.
2. Load the existing feedback safely.
3. Apply the intended update when appropriate.
4. Commit.
5. Return the final stored state.

## Recommendation-data purpose

The feedback data is intended for future recommendation improvements.

The initial MVP does not need to train a model.

A future scoring process may use:

```text
User preferences
        +
Previous votes
        +
Section type
        +
Content metadata
        ↓
Recommendation score
```

Examples:

- Positive votes on Bitcoin news may increase the ranking of similar news.
- Negative votes on meme content may reduce its visual emphasis.
- Positive AI-insight feedback may indicate that the selected tone works well.
- Aggregated feedback may help compare content quality across user types.

Do not change personalization automatically without a defined and testable
rule.

Store clean data first.

## Future training documentation

Document a future process such as:

1. Collect feedback with content metadata.
2. Remove invalid and duplicate records.
3. Build anonymized training examples.
4. Separate training, validation, and test datasets.
5. Train or evaluate a ranking model.
6. Compare against a simple rule-based baseline.
7. Measure positive-feedback rate and engagement.
8. Deploy only after offline and controlled online evaluation.
9. Monitor bias, drift, and recommendation quality.
10. Preserve user privacy.

Do not claim that a model is trained when only feedback collection exists.

## Privacy rules

Feedback is user-related behavioral data.

Rules:

- Store only the information required for recommendations.
- Do not store secrets in snapshots.
- Do not expose another user's feedback.
- Avoid logging complete personal preference profiles unnecessarily.
- Do not use feedback for unrelated purposes without documentation.
- Consider anonymization before future model training.
- Keep public reviewer endpoints free of sensitive user data.

## Implementation workflow

### Step 1: Inspect the project

Before making changes:

1. Inspect authentication and `get_current_user`.
2. Inspect the feedback model.
3. Inspect migrations.
4. Inspect dashboard response schemas.
5. Inspect content-key generation.
6. Inspect AI insight persistence.
7. Inspect news normalization.
8. Inspect coin-price data.
9. Inspect meme data.
10. Inspect feedback routes and services.
11. Inspect frontend dashboard cards.
12. Inspect existing reusable buttons.
13. Inspect tests.
14. Inspect current uncommitted changes.

Do not overwrite unrelated user work.

### Step 2: Explain the design

Before writing code, explain:

- What receives a vote in each section.
- How each content key is generated.
- How the authenticated user is resolved.
- How duplicate feedback is prevented.
- What happens when the user changes a vote.
- Whether the UI is optimistic or confirmed.
- Which files will change.
- How the feature will be tested.

### Step 3: Implement the database layer

When not already present:

1. Add the feedback model.
2. Add the user relationship.
3. Add the vote check constraint.
4. Add the composite unique constraint.
5. Add timestamps.
6. Add optional snapshot storage.
7. Create and review an Alembic migration.
8. Apply it to a disposable database.
9. Test rollback when practical.

### Step 4: Implement validation schemas

Create schemas such as:

```text
FeedbackCreate
FeedbackResponse
FeedbackQuery
```

Validate:

- Section type.
- Content-key format.
- Vote value.
- Snapshot size when accepted from the request.

Prefer server-generated snapshots.

### Step 5: Implement the feedback service

Create one reusable service for:

- Content validation.
- Ownership validation.
- Finding existing feedback.
- Creating new feedback.
- Updating existing feedback.
- Handling uniqueness conflicts.
- Committing and rolling back.

Keep route handlers thin.

### Step 6: Implement API endpoints

Implement:

```text
PUT /api/feedback
GET /api/feedback/me
```

Optionally implement:

```text
DELETE /api/feedback/{feedback_id}
```

Require authentication for every user-feedback endpoint.

### Step 7: Add feedback state to dashboard data

Ensure every displayed feedback target includes:

```text
section_type
content_key
current_user_vote
```

Avoid unnecessary request-per-card behavior.

### Step 8: Implement frontend buttons

Create one reusable feedback component.

Connect it to:

- Market news.
- Coin prices.
- AI insight.
- Crypto meme.

Add:

- Selected state.
- Saving state.
- Error recovery.
- Accessible labels.
- Keyboard support.

### Step 9: Run tests

Run:

- Database tests.
- Service tests.
- API tests.
- Frontend component tests.
- Dashboard integration tests.
- Manual end-to-end verification.

Do not claim completion based only on static inspection.

## Required backend tests

Test at least:

### Validation

- Vote `1` is accepted.
- Vote `-1` is accepted.
- Vote `0` is rejected.
- Other vote values are rejected.
- Supported section types are accepted.
- Unknown section types are rejected.
- Blank content key is rejected.
- Oversized content key is rejected.
- Mismatched section and key prefix is rejected.

### Authentication and ownership

- Unauthenticated vote is rejected.
- Authenticated user ID is used.
- Request body cannot select another user.
- User cannot vote on another user's private insight.
- One user cannot read another user's feedback.

### Persistence

- First vote creates one row.
- Same vote again does not create a duplicate.
- Changing 👍 to 👎 updates the existing row.
- Changing 👎 to 👍 updates the existing row.
- Different users may vote on the same content.
- One user may vote on different content.
- Unique constraint prevents concurrent duplicates.
- Failed transaction is rolled back.
- Timestamps update correctly.

## Required frontend tests

Test at least:

- Both feedback buttons render.
- No initial vote displays an unselected state.
- Initial positive vote displays 👍 as selected.
- Initial negative vote displays 👎 as selected.
- Clicking 👍 submits `1`.
- Clicking 👎 submits `-1`.
- Successful save displays the backend-confirmed state.
- Failed save restores the previous state.
- Saving state prevents uncontrolled duplicate requests.
- Buttons have accessible labels.
- Keyboard interaction works.
- Feedback appears in all four dashboard sections.

## Manual verification

When the application can run:

1. Log in as an onboarded user.
2. Open the dashboard.
3. Confirm all four sections display feedback controls.
4. Vote 👍 on the AI insight.
5. Confirm one database row is created.
6. Refresh the page.
7. Confirm 👍 remains selected.
8. Change the vote to 👎.
9. Confirm the same database row is updated.
10. Confirm no duplicate row is created.
11. Vote on news, prices, and meme content.
12. Confirm each uses a stable content key.
13. Log in as another user.
14. Confirm the second user's vote state is independent.
15. Simulate a failed save.
16. Confirm the UI does not falsely display success.
17. Confirm no private feedback is exposed.

## Security and quality checklist

Before marking feedback complete, verify:

- [ ] Every feedback endpoint requires authentication.
- [ ] User identity comes from the validated token.
- [ ] Request body cannot control ownership.
- [ ] Only supported section types are accepted.
- [ ] Only `1` and `-1` are accepted.
- [ ] Content keys are stable.
- [ ] Content-key formats are validated.
- [ ] Private content ownership is checked.
- [ ] Database uniqueness prevents duplicates.
- [ ] Changing a vote updates the existing row.
- [ ] Failed transactions roll back.
- [ ] Another user's feedback is never returned.
- [ ] Snapshots contain no secrets.
- [ ] Frontend failure restores the correct state.
- [ ] All four sections expose feedback controls.
- [ ] Automated tests pass.

## Scope control

Do not add these features unless explicitly requested:

- Public like counts.
- Comments.
- Social sharing.
- Following users.
- Complex collaborative filtering.
- Model training.
- Real-time analytics pipelines.
- Kafka or other event streaming.
- Gamification.
- Rewards or crypto tokens.
- Multiple feedback scales.
- Sentiment analysis of user comments.

The assignment requires simple thumbs-up and thumbs-down feedback stored for
future improvement.

## Required explanation after implementation

After completing a feedback task, report:

1. What receives a vote in every section.
2. How stable content keys work.
3. How the authenticated user is identified.
4. How the upsert behavior works.
5. How duplicate rows are prevented.
6. How existing votes are loaded.
7. How the frontend handles success and failure.
8. How feedback may support future recommendations.
9. Which files changed.
10. Which tests were run.
11. Anything that could not be verified.

Explain technical concepts in plain language.

Do not provide only a list of endpoints or files.

## Completion criteria

The feedback feature is complete only when:

- Thumbs-up and thumbs-down controls exist.
- All four dashboard sections support voting.
- Every feedback target has a stable content key.
- Only authenticated users can vote.
- Ownership comes from the authenticated request.
- Votes are stored in the database.
- Existing votes can be changed.
- Duplicate rows are prevented.
- Current votes are restored after refresh.
- Failures do not leave incorrect frontend state.
- Feedback data is suitable for future recommendation analysis.
- Automated tests pass.
- The full flow has been manually verified when possible.
- The implementation is clearly explained.

If any requirement cannot be tested, mark it as `not_verified` and explain
why.

If `$ARGUMENTS` specifies a feedback area, focus on that area while checking
its effect on authentication, content identity, persistence, frontend state,
and future recommendation use.
---
name: design-database-schema
description: Design, implement, review, or modify the PostgreSQL database schema for the Moveo AI Crypto Advisor. Use when working on SQLAlchemy models, Alembic migrations, user accounts, onboarding preferences, daily AI insights, content feedback, database constraints, relationships, seed data, or database tests. Inspect the existing schema and migrations before making changes.
argument-hint: "[table-or-database-task]"
disable-model-invocation: false
---

# Design the Crypto Advisor Database

Design and maintain a secure, consistent, and explainable PostgreSQL database
for the Moveo AI Crypto Advisor.

Use SQLAlchemy for database models and Alembic for schema migrations unless
the existing repository uses another confirmed approach.

Do not modify the database schema until the existing models, migrations, and
configuration have been inspected.

## Core objectives

The database must support:

1. User registration and authentication.
2. First-login onboarding.
3. User crypto preferences.
4. User investor type.
5. User content preferences.
6. One reusable AI insight per user and date.
7. Thumbs-up and thumbs-down feedback.
8. Prevention of duplicate feedback.
9. Timestamps for important records.
10. Safe reviewer access without exposing production credentials.

## Required database entities

Use the following entities as the default schema.

Adapt names only when the existing repository has an established naming
convention.

### User

Represent an application account.

Recommended table name:

```text
users
```

Required fields:

| Field | Suggested type | Purpose |
|---|---|---|
| `id` | UUID or integer | Primary key |
| `name` | string | User display name |
| `email` | string | Unique login identifier |
| `password_hash` | string | Securely hashed password |
| `onboarding_completed` | boolean | Controls first-login onboarding |
| `is_active` | boolean | Allows account disabling |
| `created_at` | timestamp | Account creation time |
| `updated_at` | timestamp | Last account update |

Rules:

- Normalize email addresses before saving.
- Enforce a unique constraint on `email`.
- Never store a plaintext password.
- Never return `password_hash` in an API response.
- Default `onboarding_completed` to `false`.
- Default `is_active` to `true`.

### UserPreference

Store onboarding answers for a user.

Recommended table name:

```text
user_preferences
```

Required fields:

| Field | Suggested type | Purpose |
|---|---|---|
| `id` | UUID or integer | Primary key |
| `user_id` | Foreign key | Preference owner |
| `interested_assets` | JSON/JSONB | Selected crypto asset identifiers |
| `investor_type` | string or enum | Investor profile |
| `content_types` | JSON/JSONB | Preferred content categories |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last update |

Rules:

- Enforce one preference record per user.
- Use a unique constraint on `user_id`.
- Delete preferences when the associated user is deleted.
- Store stable CoinGecko asset identifiers, not display labels.
- Validate that every saved asset is supported by the application.
- Validate that the investor type is one of the supported values.
- Validate that all content types are recognized values.

Example:

```json
{
  "interested_assets": [
    "bitcoin",
    "ethereum",
    "solana"
  ],
  "investor_type": "hodler",
  "content_types": [
    "market_news",
    "charts",
    "fun"
  ]
}
```

Use JSONB in PostgreSQL when the project uses PostgreSQL-specific types.

For the MVP, do not create multiple relationship tables for preferences unless
querying, validation, or future requirements justify the additional
complexity.

### DailyInsight

Store a generated AI insight so that the same insight can be reused throughout
the same day.

Recommended table name:

```text
daily_insights
```

Required fields:

| Field | Suggested type | Purpose |
|---|---|---|
| `id` | UUID or integer | Primary key |
| `user_id` | Foreign key | Insight owner |
| `insight_date` | date | Calendar date of the insight |
| `content` | text | Generated AI content |
| `context_snapshot` | JSON/JSONB | Facts used during generation |
| `model_provider` | string | AI provider used |
| `model_name` | string | Model identifier |
| `created_at` | timestamp | Generation time |

Rules:

- Enforce one daily insight per user and date.
- Use a composite unique constraint on `user_id` and `insight_date`.
- Delete insights when the associated user is deleted.
- Store only the context needed to explain or reproduce the generation.
- Do not store API keys, authentication tokens, or other secrets.
- Do not store unnecessary personal information.
- Do not regenerate the insight on every dashboard refresh.

Example context snapshot:

```json
{
  "assets": [
    "bitcoin",
    "ethereum"
  ],
  "investor_type": "hodler",
  "prices": {
    "bitcoin": {
      "usd": 112000,
      "change_24h": 2.4
    },
    "ethereum": {
      "usd": 4500,
      "change_24h": -1.1
    }
  },
  "news_titles": [
    "Example Bitcoin market headline"
  ]
}
```

The context snapshot must contain factual input supplied to the AI model. It
must not be treated as the source of live market data after it becomes stale.

### ContentFeedback

Store thumbs-up and thumbs-down feedback.

Recommended table name:

```text
content_feedback
```

Required fields:

| Field | Suggested type | Purpose |
|---|---|---|
| `id` | UUID or integer | Primary key |
| `user_id` | Foreign key | User who voted |
| `section_type` | string or enum | Dashboard section |
| `content_key` | string | Stable identifier for voted content |
| `vote` | small integer | Positive or negative feedback |
| `content_snapshot` | JSON/JSONB | Optional content metadata |
| `created_at` | timestamp | First vote time |
| `updated_at` | timestamp | Last vote update |

Allowed section types:

```text
market_news
coin_prices
ai_insight
crypto_meme
```

Allowed vote values:

```text
1  = thumbs up
-1 = thumbs down
```

Rules:

- Enforce a check constraint that permits only `1` or `-1`.
- Enforce one vote per user, section, and content key.
- Use a composite unique constraint on:
  - `user_id`
  - `section_type`
  - `content_key`
- Allow an existing vote to be updated.
- Do not create a duplicate row when a user changes a vote.
- Delete feedback when the associated user is deleted.
- Do not trust a `user_id` supplied by the frontend.
- Resolve the user identity from the authenticated request.

Examples of stable content keys:

```text
news:<external-article-id>
price:bitcoin:2026-08-25
insight:<daily-insight-id>
meme:<meme-id>
```

When an external API does not provide a stable identifier, generate a
deterministic identifier from stable content fields instead of using a random
identifier on every request.

## Relationship rules

Use these default relationships:

```text
User 1 ---- 0..1 UserPreference
User 1 ---- 0..* DailyInsight
User 1 ---- 0..* ContentFeedback
```

Configure ORM relationships in both directions when doing so improves code
clarity.

Avoid circular imports by placing shared SQLAlchemy base definitions and model
imports in appropriate modules.

Recommended deletion behavior:

```text
User deleted
    -> UserPreference deleted
    -> DailyInsight records deleted
    -> ContentFeedback records deleted
```

Use database-level foreign-key behavior and ORM cascade behavior carefully.

Do not configure conflicting cascade rules.

## Suggested project structure

Follow the existing project structure when one already exists.

For a new FastAPI backend, prefer a structure similar to:

```text
backend/
├── alembic/
│   ├── versions/
│   └── env.py
├── app/
│   ├── core/
│   │   └── config.py
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   ├── models/
│   │   ├── user.py
│   │   ├── user_preference.py
│   │   ├── daily_insight.py
│   │   └── content_feedback.py
│   └── schemas/
│       ├── user.py
│       ├── preference.py
│       ├── insight.py
│       └── feedback.py
├── tests/
├── alembic.ini
└── .env.example
```

Do not reorganize a working repository only to match this example.

Adapt the recommendation to the project's established structure and naming
conventions.

## SQLAlchemy models and Pydantic schemas

Do not confuse SQLAlchemy models with Pydantic schemas.

### SQLAlchemy model

A SQLAlchemy model defines:

- A physical database table.
- Columns and database types.
- Foreign keys.
- Unique constraints.
- Check constraints.
- Relationships.
- Database indexes.

### Pydantic schema

A Pydantic schema defines:

- API request validation.
- API response validation.
- Which fields clients can send.
- Which fields clients are allowed to receive.

### Alembic migration

An Alembic migration defines:

- How the physical database schema changes.
- How to apply the change using `upgrade()`.
- How to reverse the change using `downgrade()`.

Keep these three responsibilities separate.

## Database workflow

### Step 1: Inspect existing database code

Before making changes:

1. Locate the SQLAlchemy base.
2. Locate the engine and database session configuration.
3. Inspect all existing SQLAlchemy models.
4. Inspect all related Pydantic schemas.
5. Inspect the Alembic configuration.
6. Inspect all existing migration files.
7. Inspect environment-variable configuration.
8. Inspect database dependencies used by FastAPI.
9. Inspect database-related tests.
10. Inspect the current Git changes.

Do not overwrite unrelated or unfinished user changes.

Report important inconsistencies before modifying the schema.

### Step 2: Explain the proposed change

Before implementation, explain:

- What entity or field will be added or changed.
- Why the change is required.
- Which tables and relationships are affected.
- Whether existing data may be affected.
- What database constraint will protect data integrity.
- Whether a migration is required.
- How the change will be tested.

Keep the explanation concise and understandable.

### Step 3: Implement SQLAlchemy models

When implementation is requested:

1. Add or update SQLAlchemy models.
2. Use explicit column types.
3. Define nullability explicitly.
4. Add indexes only where query patterns justify them.
5. Add foreign-key constraints.
6. Add unique constraints.
7. Add check constraints.
8. Add relationships.
9. Add creation and update timestamps.
10. Keep naming consistent.
11. Add useful type annotations.
12. Avoid business logic inside database models unless the project uses that
   convention consistently.

Do not add fields without a clear application requirement.

### Step 4: Create Pydantic schemas

Create separate schemas for different API responsibilities.

Recommended schemas include:

```text
UserCreate
UserLogin
UserResponse

UserPreferenceCreate
UserPreferenceUpdate
UserPreferenceResponse

DailyInsightResponse

FeedbackCreate
FeedbackUpdate
FeedbackResponse
```

Rules:

- Never include `password_hash` in a public response.
- Do not allow clients to set server-controlled fields.
- Do not allow clients to choose another user's `user_id`.
- Validate enum-like values.
- Validate that lists are not empty when the product requires a selection.
- Use a consistent response format across the API.
- Support ORM serialization using the appropriate Pydantic version.

Inspect the installed Pydantic version before choosing its configuration
syntax.

### Step 5: Create an Alembic migration

Generate or write a migration for every physical schema change.

The migration must contain:

- A valid `upgrade()` operation.
- A valid `downgrade()` operation.
- Correct table creation order.
- Correct foreign-key creation order.
- Explicit and consistent constraint names.
- No unrelated schema changes.

Review autogenerated migrations manually.

Do not assume that an autogenerated migration is correct.

Pay particular attention to:

- PostgreSQL enum creation and removal.
- JSON versus JSONB.
- Server defaults.
- Timestamp defaults.
- Cascade behavior.
- Composite unique constraints.
- Existing data that may violate a new constraint.

### Step 6: Validate migrations

When a disposable test database is available:

1. Start with an empty database.
2. Apply all migrations.
3. Verify that all expected tables exist.
4. Verify that all required constraints exist.
5. Roll back the newest migration.
6. Apply the newest migration again.
7. Run database tests.

Never test destructive migration behavior against a production database.

If a disposable database is unavailable, report migration execution as
`not_verified`.

Do not claim that a migration works only because the migration file looks
correct.

### Step 7: Test data integrity

Test at least:

- A valid user can be created.
- Duplicate email addresses are rejected.
- Password hashes can be stored but are not exposed.
- One preference row is allowed per user.
- A user can update existing preferences.
- Supported onboarding values are stored correctly.
- Unsupported preference values are rejected.
- One daily insight is allowed per user and date.
- Different users can receive insights on the same date.
- Vote values other than `1` and `-1` are rejected.
- Duplicate feedback is prevented or updated.
- A user can change a vote.
- Different users can vote on the same content.
- One user can vote on different content.
- Foreign-key rules behave as expected.
- Cascading deletion behaves as intended.
- Timestamps are created and updated correctly.

## Transaction rules

Use transactions for operations that must succeed or fail together.

Examples:

- Saving onboarding preferences and marking onboarding as completed.
- Updating an existing feedback vote.
- Creating a daily insight while enforcing daily uniqueness.
- Creating a user account and its required initial data.

On failure:

1. Roll back the transaction.
2. Log useful internal context.
3. Return a safe API error.
4. Do not leave partially updated data.
5. Do not expose database implementation details to the client.

Use database integrity constraints as the final protection against race
conditions.

Application-level checks alone are not enough.

## Feedback update behavior

Use upsert-like behavior for feedback.

Expected flow:

```text
Authenticated user submits vote
        ↓
Validate section type and vote
        ↓
Find feedback by user + section + content key
        ↓
Existing feedback?
        ├── Yes: update vote and updated_at
        └── No: create feedback row
        ↓
Commit transaction
        ↓
Return saved feedback
```

Handle concurrent duplicate submissions safely.

Do not rely only on a preliminary `SELECT` query. Keep the database unique
constraint in place.

## Date and time rules

Use timezone-aware UTC timestamps for stored timestamps.

Recommended behavior:

- Store `created_at` and `updated_at` in UTC.
- Store `insight_date` as a date.
- Determine `insight_date` using a documented application timezone.
- Do not calculate the daily date differently across multiple services.
- Do not use a naive local timestamp for persisted events.

The application may initially target users in Israel, but do not hardcode a
personal timezone into the database schema.

If a single product timezone is selected, configure it through application
settings.

## Seed and demo data

Provide an optional development seed process.

Seed data may include:

- A test user.
- Example onboarding preferences.
- Example feedback.
- An example daily insight.

Rules:

- Never include a real password.
- Never include a production credential.
- Use an obviously fake demo email.
- Hash any demo password using the real password-hashing process.
- Keep production seeding disabled by default.
- Make repeated development seeding idempotent when practical.
- Clearly distinguish demo data from real data.

Example demo identity:

```text
demo@example.com
```

Do not include a usable shared password in a public repository unless the demo
environment is intentionally designed for public access.

## Reviewer database access

The Moveo assignment asks for access to the database.

Do not publish the production database connection string.

Do not commit database credentials to GitHub.

Prefer one of these approaches:

1. A demo application account that creates inspectable data.
2. A protected read-only admin endpoint.
3. A temporary read-only database credential shared privately.
4. A documented local database setup with seed data.

Recommend the safest option that still allows the reviewer to verify that:

- Registration data is stored.
- Preferences are stored.
- Daily insights are reused.
- Feedback is stored and updated.

If an admin endpoint is implemented:

- Protect it with authentication and authorization.
- Never expose password hashes.
- Never expose tokens or secrets.
- Return only the minimum necessary data.
- Do not make it publicly discoverable without protection.

## Database configuration

Read the connection URL from an environment variable.

Recommended variable:

```text
DATABASE_URL
```

The repository should contain:

```text
.env.example
```

Example:

```env
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/crypto_advisor
```

This value must be a placeholder.

Do not commit the real `.env` file.

Handle provider-specific connection strings deliberately. Some providers may
supply a URL beginning with:

```text
postgres://
```

while the selected SQLAlchemy driver may require a different scheme.

Normalize the URL in one controlled configuration location if necessary.

Do not repeat database URL transformations across the codebase.

## Session management

For FastAPI:

- Create one database session per request.
- Close the session after the request completes.
- Roll back failed transactions.
- Do not reuse one global mutable session.
- Keep session creation in the database layer.
- Inject sessions through FastAPI dependencies.

Follow the existing synchronous or asynchronous database approach.

Do not mix synchronous and asynchronous SQLAlchemy usage without a clear
reason.

## Performance guidance

Keep the MVP simple.

Add indexes for demonstrated access patterns, such as:

- `users.email`
- `daily_insights.user_id`
- `daily_insights.insight_date`
- The combined daily insight lookup
- `content_feedback.user_id`
- Fields used for feedback upserts

Do not add speculative indexes to every column.

Avoid an unnecessary generic `content_items` table unless the application
needs to persist external news, coin prices, or memes as independent
entities.

For the initial MVP, a stable `content_key` and optional content snapshot are
sufficient for external content feedback.

## Error handling

Translate known database failures into safe application errors.

Examples:

| Database condition | API behavior |
|---|---|
| Duplicate email | Return a conflict response |
| Missing related user | Return an authorization or not-found response |
| Invalid vote constraint | Return a validation response |
| Duplicate daily insight | Return the existing insight when appropriate |
| Database unavailable | Return a controlled service error |

Do not send raw SQL errors, connection strings, table internals, or stack
traces to the frontend.

Log enough internal information to diagnose the failure without logging
passwords, tokens, or complete secrets.

## Scope control

Do not add database complexity without a clear requirement.

Avoid adding these to the MVP unless explicitly requested:

- Event sourcing
- Multiple database services
- A separate analytics database
- Complex recommendation-model tables
- Cryptocurrency transaction records
- Wallet information
- Trading orders
- Payment information
- A generic social network schema
- Premature data warehousing

The assignment requires a personalized content dashboard, not a real trading
platform.

## Required explanation after implementation

After implementing a database task, report:

1. What changed.
2. Why the change was needed.
3. Which files changed.
4. The resulting table or relationship.
5. The migration created.
6. The constraints added.
7. The tests performed.
8. Any remaining database risk.
9. Anything that could not be verified.

Explain the relevant database concepts in plain language.

Do not provide only a list of changed files.

## Completion criteria

A database task is complete only when:

- Models match the intended schema.
- Pydantic schemas validate the intended API data.
- Private fields are not exposed.
- A migration exists for every schema change.
- The migration has been reviewed.
- Constraints protect important business rules.
- Database tests pass.
- No secrets appear in the repository.
- Existing unrelated work remains unchanged.
- The result is explained clearly.

If any check cannot be performed, mark it as `not_verified` and explain why.

If `$ARGUMENTS` specifies a table or database task, focus on that area while
checking all directly affected relationships, schemas, migrations, and tests.
---
name: plan-crypto-advisor
description: Plan and review the implementation of the Moveo AI Crypto Advisor web application. Use when starting the project, planning a new feature, reviewing current progress, deciding architecture, identifying missing requirements, or determining the next implementation step. Inspect the existing repository before proposing changes and keep every decision aligned with the Moveo coding assignment.
argument-hint: "[feature-or-area]"
disable-model-invocation: false
---

# Plan the Moveo AI Crypto Advisor

Create a clear, evidence-based implementation plan for the Moveo AI Crypto
Advisor web application.

Do not implement production code while running this skill unless the user
explicitly asks to proceed with implementation.

## Project objective

Build a deployed full-stack web application that provides a personalized
crypto dashboard.

The application must:

1. Allow users to register and log in.
2. Show onboarding after the user's first login.
3. Save the user's crypto and content preferences.
4. Display a personalized daily dashboard.
5. Display market news.
6. Display selected coin prices.
7. Generate a daily AI insight.
8. Display a dynamic crypto meme.
9. Allow thumbs-up and thumbs-down feedback for each dashboard section.
10. Store feedback for future recommendation improvements.
11. Be publicly deployed.
12. provide a public GitHub repository.
13. Document how AI tools were used during development.
14. Provide a safe way for reviewers to inspect stored data.
15. Explain a future feedback-based model improvement process.

## Preferred architecture

Use this architecture unless the existing repository or an explicit user
decision requires a different approach:

- Frontend: React or Next.js with TypeScript
- Backend: FastAPI with Python
- Database: PostgreSQL
- ORM: SQLAlchemy
- Database migrations: Alembic
- Authentication: JWT access tokens
- Password hashing: bcrypt or an equivalent secure password-hashing library
- Coin data: CoinGecko API
- News: CryptoPanic API with a local static fallback
- AI insights: OpenRouter or Hugging Face free-tier API
- Memes: Curated local JSON data or a reliable free public source
- API documentation: FastAPI OpenAPI and Swagger
- Frontend deployment: Vercel
- Backend deployment: Render or Railway
- Database hosting: A managed PostgreSQL free tier

Do not replace a confirmed project technology without explaining the reason
and receiving the user's approval.

## Planning workflow

### Step 1: Inspect the repository

Before creating the plan:

1. Inspect the repository structure.
2. Read the relevant configuration files.
3. Read existing documentation.
4. Identify the frontend, backend, and database setup.
5. Inspect existing tests.
6. Inspect existing environment-variable examples.
7. Check the current Git status without modifying unrelated work.

Do not assume that a feature is missing until the relevant files have been
inspected.

### Step 2: Establish the current state

Classify every assignment requirement as one of:

- `complete`
- `partially_complete`
- `missing`
- `blocked`
- `not_verified`

For every classification, cite the relevant repository file or explain why
evidence is unavailable.

### Step 3: Clarify important decisions

Ask the user only about decisions that materially affect the architecture or
result.

Do not ask questions whose answers can be found safely in the repository.

When multiple valid approaches exist:

1. Recommend one option.
2. Explain why it fits this project.
3. Briefly explain the main tradeoff.
4. Wait for confirmation only when the choice would be difficult to reverse.

### Step 4: Produce an ordered implementation plan

Divide work into small, verifiable phases.

Use this preferred order unless repository evidence requires a different
sequence:

1. Project foundation and local development setup
2. Database schema and migrations
3. Authentication
4. User onboarding and preferences
5. External crypto-data integrations
6. AI insight generation
7. Dashboard API
8. Dashboard frontend
9. Feedback collection
10. Error handling and fallbacks
11. Automated tests
12. Deployment
13. AI usage documentation
14. Final delivery review

For each phase, include:

- Objective
- Files or components affected
- Main implementation tasks
- Dependencies
- Important edge cases
- Security considerations
- Verification method
- Definition of done

### Step 5: Verify requirement coverage

Confirm that the plan covers every mandatory Moveo requirement.

Pay particular attention to requirements that are easy to overlook:

- Onboarding must happen after the first login.
- Preferences must affect displayed content.
- All four dashboard sections must be displayed.
- Every section must support voting.
- Votes must be stored in the database.
- External API failures must not break the entire dashboard.
- The deployed application must be publicly accessible.
- AI tool usage must be documented.
- Database access must not expose production credentials publicly.
- The bonus asks for a proposed training process, not an implemented
  machine-learning training pipeline.

### Step 6: Identify risks

Report risks that could prevent successful delivery, including:

- Free-tier API limits
- External API outages
- Missing API keys
- CORS configuration
- JWT security
- Exposed secrets
- Database persistence
- Duplicate feedback
- Repeated AI generation and unnecessary API costs
- Deployment environment differences
- Financial-advice wording
- Missing loading, empty, or error states

For each important risk, include a practical mitigation.

## Personalization rules

Preferences must influence actual application behavior.

Use the user's selected assets to:

- Select displayed prices.
- Filter or rank relevant news.
- Provide context to the AI insight.

Use the investor type to adjust the style of the AI insight.

Examples:

- A HODLer should receive longer-term context.
- A Day Trader may receive short-term price and volatility context.
- An NFT Collector may receive relevant NFT-oriented content when available.

Use content preferences to rank or emphasize dashboard sections.

Do not silently remove a mandatory dashboard section solely because the user
did not select it during onboarding.

## AI insight rules

Plan for one reusable daily insight per user and date.

Do not generate a new insight on every page refresh.

The generated insight should use available factual context, such as:

- Selected assets
- Investor type
- Current price data
- Relevant news headlines
- Previous feedback when available

Do not present generated content as guaranteed financial advice.

Include a visible disclaimer similar to:

> This content is for informational purposes only and is not financial advice.

Do not allow the language model to invent current market data when factual
data is unavailable.

## Data and security rules

The plan must require:

- Unique user email addresses
- Secure password hashing
- No plaintext password storage
- No secrets committed to Git
- An `.env.example` file containing placeholder values only
- Authentication for private user endpoints
- Ownership checks for user preferences and feedback
- Input validation
- Safe error responses
- CORS restricted to expected origins in production
- Database migrations
- A uniqueness rule preventing duplicate votes for the same user and content
- A safe reviewer-access method that does not publish production credentials

## Fallback requirements

The dashboard must remain usable when an optional external service fails.

Plan explicit fallbacks:

- Coin data failure: show a clear unavailable state or recent cached data.
- News failure: use curated static news data.
- AI failure: show a safe predefined insight or retry option.
- Meme failure: use a local meme entry.
- Partial dashboard failure: keep unaffected sections available.

Do not hide failures silently.

## Scope control

Prioritize a polished and reliable MVP.

Do not add the following unless all mandatory requirements are complete or
the user explicitly requests them:

- Real crypto trading
- Wallet connections
- Payments
- Complex machine-learning training pipelines
- Real-time WebSocket price streaming
- Kubernetes
- Microservices
- A large multi-agent system
- Unnecessary infrastructure

Prefer the simplest implementation that is secure, testable, and easy to
explain during an interview.

## Explanation requirements

The user wants to understand the project deeply.

When presenting the plan:

1. Explain the purpose of each phase in plain language.
2. Explain how frontend, backend, database, and external APIs communicate.
3. Explain important technical terms when first introduced.
4. Explain why a suggested technology or pattern is used.
5. Distinguish mandatory requirements from optional improvements.
6. Use small examples when they clarify data flow or behavior.
7. Do not provide large unexplained code blocks.

## Required output format

Return the plan in this order:

1. Current repository state
2. Assumptions
3. Requirement coverage
4. Recommended architecture
5. Ordered implementation phases
6. Data flow
7. Main risks and mitigations
8. Testing strategy
9. Deployment strategy
10. Immediate next step

End with one concrete next action.

If `$ARGUMENTS` specifies a feature or project area, focus the plan on that
area while still checking its dependencies and its effect on the full
assignment.
---
name: document-ai-usage
description: Create, update, review, or verify the AI_USAGE.md disclosure for the Moveo AI Crypto Advisor coding assignment. Use when documenting interactions with ChatGPT, Claude, Cursor, GitHub Copilot, or other AI tools; summarizing prompts and suggestions; recording human decisions; explaining verification; preparing assignment deliverables; or checking that AI assistance is disclosed accurately without exposing secrets or private data. Inspect the repository history, project documentation, current implementation, and existing AI usage notes before writing.
argument-hint: "[create|update|review|finalize]"
disable-model-invocation: false
---

# Document AI Tool Usage

Create and maintain an accurate `AI_USAGE.md` document for the Moveo AI Crypto
Advisor.

The Moveo assignment explicitly requires a summary of interactions with AI
tools used during development.

The document should help reviewers understand:

1. Which AI tools were used.
2. What each tool helped with.
3. What prompts or questions were asked.
4. Which suggestions were accepted.
5. Which suggestions were changed or rejected.
6. Which decisions remained the developer's responsibility.
7. How AI-generated output was tested and verified.
8. What limitations or risks were identified.
9. How the developer understands the final implementation.

Do not present AI usage as a substitute for understanding the project.

Do not hide meaningful AI assistance.

Do not claim that work was completed manually when an AI tool materially
contributed to it.

## Required output file

Create or update:

```text
AI_USAGE.md
```

Place it in the repository root unless the existing project documentation uses
another deliberate location.

Recommended repository structure:

```text
project-root/
├── README.md
├── AI_USAGE.md
├── frontend/
└── backend/
```

Do not create multiple conflicting AI-disclosure files.

## Main documentation objective

The document should demonstrate responsible AI collaboration.

It should communicate this process:

```text
Developer defines requirement
        ↓
AI suggests an approach
        ↓
Developer reviews the suggestion
        ↓
Developer adapts or rejects it
        ↓
Implementation is tested
        ↓
Result is verified against the assignment
```

The document must not suggest:

```text
AI generated everything and the developer accepted it without review
```

It also must not falsely minimize AI involvement.

## Evidence sources

Before writing or updating the document, inspect available evidence such as:

- Existing `AI_USAGE.md`.
- README.
- Project Skills.
- Implementation plans.
- Source code.
- Test files.
- Git history when available.
- Commit messages when useful.
- Saved prompts supplied by the user.
- Development notes.
- Pull requests when available locally.
- Conversation summaries provided by the user.

Do not invent an interaction merely because it would sound useful.

If exact prompt wording is unavailable, write a faithful summary and label it
as a paraphrase.

## Tools to document

Document only tools actually used.

Possible tools include:

```text
ChatGPT
Claude
Claude Code
Cursor
GitHub Copilot
Other LLM assistants
```

For each tool, record:

- Tool name.
- Main purpose.
- Areas where it contributed.
- Nature of the collaboration.
- Human verification performed.

Do not list a tool just because it was installed or available.

## Recommended document structure

Use this structure:

```markdown
# AI Tool Usage

## Overview

## Tools Used

## How AI Was Used

### 1. Requirements and Planning
### 2. Architecture and Database Design
### 3. Authentication
### 4. Onboarding and Personalization
### 5. External API Integrations
### 6. AI Insight Feature
### 7. Feedback System
### 8. Dashboard and UX
### 9. Testing and Debugging
### 10. Deployment and Documentation

## Representative Interactions

## Suggestions Accepted

## Suggestions Modified or Rejected

## Human Verification

## Limitations and Responsible Use

## Final Responsibility
```

Adapt the sections to actual project activity.

Remove empty sections instead of filling them with invented content.

## Overview section

Explain briefly:

- AI tools supported planning and implementation.
- The developer remained responsible for design decisions.
- Suggestions were reviewed before use.
- Code and behavior were tested.
- Secrets and private data were not intentionally shared.

Example:

```markdown
## Overview

I used AI-assisted development tools during this assignment to help analyze
requirements, plan the architecture, review implementation options, generate
initial code suggestions, and identify test cases.

I reviewed and adapted the suggestions before including them in the project.
I remained responsible for the final architecture, source code, security
choices, testing, and deployment.
```

Use first-person language because this is the developer's disclosure.

## Tools Used section

Use a concise table.

Example:

```markdown
## Tools Used

| Tool | Main use |
|---|---|
| ChatGPT | Requirements analysis, architecture planning, explanations and review |
| Claude Code | Repository inspection, implementation assistance and test execution |
```

Include Cursor or GitHub Copilot only if they were actually used.

Do not claim exact product versions unless verified.

## How AI Was Used section

Describe material contributions by project area.

### Requirements and planning

Possible accurate topics:

- Breaking the assignment into features.
- Distinguishing mandatory and bonus requirements.
- Identifying deliverables.
- Designing an implementation sequence.
- Avoiding unnecessary scope.

### Architecture and database

Possible topics:

- Comparing database structures.
- Designing relationships.
- Identifying database constraints.
- Planning migrations.
- Separating ORM models and API schemas.

### Authentication

Possible topics:

- Reviewing JWT flow.
- Identifying secure password-hashing requirements.
- Designing protected endpoints.
- Identifying authentication tests.

### Onboarding

Possible topics:

- Designing question flow.
- Mapping display labels to stored values.
- Connecting preferences to the authenticated user.
- Preventing inconsistent completion state.

### External integrations

Possible topics:

- Designing provider-client boundaries.
- Planning timeouts and caching.
- Normalizing external responses.
- Creating fallback behavior.

### AI insight

Possible topics:

- Designing a grounded prompt.
- Preventing invented market facts.
- Treating news as untrusted input.
- Reusing one stored insight per day.
- Adding a financial disclaimer.

### Feedback

Possible topics:

- Designing stable content keys.
- Implementing upsert behavior.
- Preventing duplicate votes.
- Documenting future recommendation use.

### Dashboard

Possible topics:

- Designing reusable cards.
- Planning partial-failure states.
- Applying user preferences.
- Improving accessibility and responsiveness.

### Testing

Possible topics:

- Generating edge-case lists.
- Creating mocked external responses.
- Diagnosing failures.
- Reviewing security-sensitive behavior.
- Planning the end-to-end journey.

### Deployment

Possible topics:

- Reviewing environment variables.
- Planning deployment architecture.
- Diagnosing CORS or migration issues.
- Building a production smoke-test checklist.

Only include topics that reflect real work.

## Representative interactions

Provide a small number of representative examples.

Do not paste the entire conversation history.

Use a table:

```markdown
## Representative Interactions

| Area | Prompt or request | AI contribution | My decision and verification |
|---|---|---|---|
| Requirements | “Analyze the Moveo assignment and divide it into mandatory features and optional improvements.” | Produced a requirement breakdown and implementation order. | I compared the breakdown with the original PDF and kept the four mandatory dashboard sections. |
| Database | “How should preferences, daily insights, and feedback be stored?” | Suggested separate preference, insight, and feedback entities with uniqueness constraints. | I reviewed the relationships, implemented migrations, and tested database constraints. |
| AI insight | “How can I generate a personalized insight without inventing market data?” | Suggested grounding the prompt with backend-fetched prices and news. | I ensured all numeric facts came from provider data and tested provider-failure fallback. |
```

If using exact prompts, preserve their meaning.

If summarizing, add a short note:

```text
The prompts below are representative summaries rather than a complete
conversation transcript.
```

## Suggestions accepted

Describe important suggestions that became part of the implementation.

Possible examples:

- Separate preference records from user authentication data.
- Store one daily insight per user and date.
- Use a database uniqueness constraint for feedback.
- Keep external provider calls in backend clients.
- Add timeout and fallback behavior.
- Use a fixed financial disclaimer.
- Test provider integrations with mocks.

For every accepted suggestion, explain why it was selected.

Example:

```markdown
- I accepted the suggestion to store one daily insight per user and date
  because it prevents unnecessary AI API calls and gives feedback a stable
  target.
```

Do not create a long list of trivial autocomplete suggestions.

## Suggestions modified or rejected

This section is important because it demonstrates judgment.

Possible examples:

- Rejecting Kubernetes because it is unnecessary for the MVP.
- Rejecting a multi-agent system because a direct LLM request is sufficient.
- Rejecting live Reddit scraping in favor of curated static memes.
- Simplifying an overly complex normalized preference schema.
- Changing token-storage strategy after reviewing security tradeoffs.
- Rejecting repeated AI generation on every refresh.

For each item, explain:

1. What was suggested.
2. Why it was not suitable.
3. What was used instead.

Example:

```markdown
- A more complex recommendation model was considered, but I kept the initial
  implementation focused on storing structured feedback. The assignment asks
  only for a future training proposal, and the available dataset would not
  justify model training.
```

Do not invent rejected suggestions solely to make the document appear more
thoughtful.

## Human decisions

Clearly identify decisions made by the developer.

Examples:

- Final technology stack.
- Database schema.
- Authentication approach.
- Supported onboarding options.
- External API selection.
- Cache duration.
- Fallback behavior.
- Dashboard layout.
- Deployment providers.
- Test coverage priorities.

Example:

```markdown
## Human Decisions

I made the final decisions regarding the project scope, architecture,
database constraints, security model, UI behavior, provider selection, and
deployment configuration. AI-generated suggestions were treated as proposals
and were not applied automatically.
```

## Human verification

Describe how AI suggestions were checked.

Include relevant methods:

- Comparing output with the original assignment.
- Reading official API documentation.
- Reviewing generated code.
- Running linters.
- Running type checking.
- Running unit tests.
- Running API tests.
- Running integration tests.
- Applying database migrations.
- Inspecting the rendered frontend.
- Testing authentication manually.
- Testing the deployed application.
- Checking browser network requests.
- Reviewing logs without exposing secrets.

Use concrete commands only when they match the repository.

Example:

```markdown
## Human Verification

I verified AI-assisted work by:

- Comparing implemented features with the original Moveo task.
- Reviewing every modified source file.
- Running backend and frontend automated tests.
- Applying database migrations to a disposable database.
- Testing the complete flow from signup through dashboard feedback.
- Simulating external API failures to verify fallbacks.
- Inspecting the deployed application on desktop and mobile.
```

Do not claim tests were run when they were not.

Mark unperformed checks honestly.

## Correct status language

Use:

```text
Implemented and tested
Implemented but not deployed
Tested with mocked provider responses
Manually verified
Not yet verified
Blocked by missing provider credentials
```

Avoid:

```text
Fully verified
Production-ready
Completely secure
Bug-free
```

unless there is sufficient evidence.

## AI-generated code disclosure

Explain how generated code was handled.

Example:

```markdown
AI tools proposed code structures and implementation snippets. I reviewed,
adapted, and integrated relevant suggestions into the existing architecture.
I did not treat generated code as correct by default; I tested important
behavior and changed suggestions that did not fit the project.
```

Do not imply that generated code is automatically owned, secure, or correct.

## Debugging disclosure

When AI helped diagnose a bug, document representative important cases.

Example:

```markdown
AI assistance helped identify that the onboarding redirect loop was caused by
stale frontend authentication state. I confirmed the issue through browser
behavior and fixed it by refreshing the current user after preferences were
saved.
```

Include only real debugging events.

Do not create imaginary problems.

## Security disclosure

Explain relevant safety practices:

- No passwords shared with AI tools.
- No production credentials included in prompts.
- No real JWT secrets included.
- No database passwords pasted into documentation.
- External content treated as untrusted.
- AI suggestions reviewed for security issues.

If sensitive information was accidentally shared, do not hide it.

Remove it from documentation, rotate affected secrets, and report the
necessary remediation privately.

## Limitations and responsible use

Document limitations such as:

- AI output may be incorrect.
- Current provider documentation was checked independently.
- Generated code required review.
- Automated tests do not prove absence of every bug.
- Free-tier APIs may be unavailable or rate-limited.
- AI insight is informational and not financial advice.
- Feedback is stored for future improvement but no model is trained yet.

Example:

```markdown
## Limitations and Responsible Use

AI-generated suggestions can be incomplete or incorrect, so I did not use
them as the sole source of technical truth. Provider-specific behavior was
checked against current documentation, and critical flows were tested.

The dashboard's AI insight is educational content and not financial advice.
The application stores feedback for future recommendation improvements, but
this version does not train or fine-tune a model.
```

## Final responsibility

End with a clear statement.

Example:

```markdown
## Final Responsibility

I am responsible for the final implementation and for the decisions made in
this project. AI tools supported the development process, but I reviewed,
modified, tested, and documented the resulting work.
```

## Confidentiality rules

Do not include:

- API keys.
- JWT secrets.
- Database connection strings.
- Passwords.
- Access tokens.
- Private repository credentials.
- Complete private conversation exports.
- Confidential company data.
- Personal information unrelated to the assignment.
- Hidden system prompts.
- Internal tool instructions.

Use placeholders when configuration examples are needed.

## Writing-quality rules

The document must be:

- Written in clear English.
- Professional.
- Honest.
- Concise.
- Specific enough to demonstrate real collaboration.
- Understandable without reading all development conversations.
- Consistent with the actual repository.

Avoid:

- Marketing language.
- Excessive praise of AI tools.
- Claims that cannot be verified.
- Long copied conversations.
- Repeating the README.
- Generic statements without examples.
- Describing AI as the final decision-maker.

## Workflow

### Step 1: Inspect existing evidence

Before writing:

1. Read the original Moveo requirements.
2. Read the project README.
3. Read an existing `AI_USAGE.md`.
4. Inspect project Skills.
5. Inspect the implemented features.
6. Inspect tests.
7. Inspect Git history when useful.
8. Collect user-provided interaction summaries.
9. Identify what cannot be confirmed.

### Step 2: Build an interaction inventory

Create an internal list containing:

```text
Tool
Project area
User request or prompt
AI suggestion
Developer decision
Implementation result
Verification status
```

Do not place unsupported entries into the final document.

### Step 3: Separate facts from assumptions

Classify information as:

```text
confirmed
user-reported
inferred
unknown
```

Use only confirmed or explicitly user-reported interactions as facts.

Ask for clarification when an unknown detail would materially change the
disclosure.

### Step 4: Draft the document

Write:

- Overview.
- Tool list.
- Main use areas.
- Representative interactions.
- Accepted suggestions.
- Modified or rejected suggestions.
- Human verification.
- Limitations.
- Final responsibility.

### Step 5: Verify against the repository

Check that:

- Mentioned features exist.
- Mentioned tests exist or are accurately marked as planned.
- Mentioned providers match configuration.
- Mentioned deployment matches the real deployment.
- Mentioned files and commands are accurate.
- No secrets appear.

### Step 6: Update after meaningful work

Update `AI_USAGE.md` after:

- A major architecture decision.
- A new AI-assisted feature.
- Important debugging assistance.
- A significant rejected suggestion.
- Test-generation assistance.
- Deployment troubleshooting.

Do not wait until the final day and rely on incomplete memory.

### Step 7: Final review

Before delivery:

1. Confirm all used tools are listed.
2. Confirm important contributions are represented.
3. Confirm developer decisions are clear.
4. Confirm verification is honest.
5. Remove secrets and private content.
6. Correct outdated implementation details.
7. Check Markdown formatting.
8. Check spelling and clarity.

## Suggested complete template

Use this as a starting point and replace placeholders with confirmed project
details:

```markdown
# AI Tool Usage

## Overview

I used AI-assisted development tools during this assignment to help analyze
requirements, plan the architecture, review implementation options, generate
initial code suggestions, identify edge cases, and prepare testing
strategies.

I reviewed and adapted relevant suggestions before including them in the
project. I remained responsible for the final architecture, implementation,
security decisions, testing, and deployment.

## Tools Used

| Tool | Main use |
|---|---|
| [Tool name] | [How it was used] |

## How AI Was Used

### Requirements and Planning

[Describe how AI helped analyze the task and organize the implementation.]

### Architecture and Database Design

[Describe relevant schema and architecture discussions.]

### Authentication

[Describe assistance related to signup, login, JWT, and security.]

### Onboarding and Personalization

[Describe how preferences and routing were planned or reviewed.]

### External API Integrations

[Describe assistance with price, news, timeout, cache, and fallback behavior.]

### AI Insight Feature

[Describe prompt design, grounding, persistence, and safety.]

### Feedback System

[Describe content keys, vote updates, and future recommendation use.]

### Dashboard and UX

[Describe component planning, responsive design, and partial failures.]

### Testing and Debugging

[Describe generated test scenarios and real debugging assistance.]

### Deployment

[Describe environment, CORS, migration, or hosting assistance.]

## Representative Interactions

The examples below summarize representative interactions and are not a
complete transcript.

| Area | Prompt or request | AI contribution | My decision and verification |
|---|---|---|---|
| [Area] | [Prompt summary] | [Suggestion] | [Decision and verification] |

## Suggestions Accepted

- [Accepted suggestion and reason.]

## Suggestions Modified or Rejected

- [Suggestion, why it was changed or rejected, and what was used instead.]

## Human Verification

I verified AI-assisted work by:

- [Verification step.]
- [Verification step.]
- [Verification step.]

## Limitations and Responsible Use

AI-generated suggestions can be incomplete or incorrect, so I did not use
them as the sole source of technical truth.

The dashboard's AI insight is informational and is not financial advice.
Feedback is stored for possible future recommendation improvements, but this
version does not train or fine-tune a model.

## Final Responsibility

I am responsible for the final implementation and the decisions made in this
project. AI tools supported the development process, but I reviewed,
modified, tested, and documented the resulting work.
```

Do not leave placeholders in the final submitted document.

## Required report after updating the file

After creating or updating `AI_USAGE.md`, report:

1. Which AI tools are documented.
2. Which project areas are covered.
3. How representative interactions were selected.
4. Which human decisions are highlighted.
5. Which verification steps are confirmed.
6. Which statements remain unverified.
7. Whether any sensitive information was removed.
8. Which sections still require user input.

Do not claim the document is final if it contains assumptions or placeholders.

## Completion criteria

The AI usage documentation is complete only when:

- Every AI tool actually used is listed.
- Major AI-assisted project areas are described.
- Representative interactions are included.
- Accepted suggestions are explained.
- Meaningful modified or rejected suggestions are included when they occurred.
- Human decisions are clearly identified.
- Verification methods are documented honestly.
- Unperformed checks are not described as completed.
- Limitations are acknowledged.
- No secrets or private data are exposed.
- No placeholders remain.
- The document matches the final repository.
- The developer accepts responsibility for the result.
- The file is clear, professional, and ready for Moveo reviewers.

If any information cannot be confirmed, mark it as `not_verified` or request
the missing information.

If `$ARGUMENTS` specifies a documentation action, focus on that action while
preserving factual accuracy and checking the document against the real
project.
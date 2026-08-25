---
name: integrate-crypto-data
description: Build, review, test, or modify external crypto-data integrations for the Moveo AI Crypto Advisor. Use when working on CoinGecko coin prices, CryptoPanic or alternative crypto news, HTTP clients, API keys, caching, retries, timeouts, fallback data, data normalization, personalized asset filtering, dashboard data services, or external API tests. Inspect the existing preferences, configuration, services, schemas, routes, and tests before making changes.
argument-hint: "[prices|news|cache|fallback|tests|review]"
disable-model-invocation: false
---

# Integrate Crypto Prices and News

Build and maintain reliable external crypto-data integrations for the Moveo AI
Crypto Advisor.

The integration layer must provide:

1. Current prices for the user's selected crypto assets.
2. Relevant market news.
3. Normalized internal response formats.
4. Controlled timeouts.
5. Safe error handling.
6. Cache behavior where useful.
7. Static fallback content when appropriate.
8. Partial dashboard availability when one service fails.
9. Tests that do not depend entirely on live external APIs.

Use only free public APIs or free-tier services, as required by the Moveo
assignment.

## Preferred data sources

Use these providers unless the project already uses another approved free
source:

```text
Coin prices → CoinGecko
Market news → CryptoPanic
```

For market news, use curated local fallback data if the external provider is
unavailable, unconfigured, rate-limited, or unsuitable for the deployed
environment.

Do not scrape a provider when its terms or technical restrictions do not
clearly allow it.

Before implementing or changing a live integration:

1. Read the provider's current official documentation.
2. Confirm the current authentication requirements.
3. Confirm the current request parameters.
4. Confirm the current response structure.
5. Confirm free-tier limitations relevant to the project.
6. Avoid relying on remembered or outdated endpoint details.

## Architecture

The frontend should communicate only with the application backend.

Preferred flow:

```text
Frontend
    ↓
FastAPI dashboard endpoint
    ↓
Application service
    ├── CoinGecko client
    └── News client
```

Avoid:

```text
Frontend
    ↓
CoinGecko or CryptoPanic directly
```

Backend integration provides:

- Centralized validation.
- Secret protection.
- Stable internal response formats.
- Cache control.
- Error handling.
- Easier testing.
- The ability to replace providers later.

## Separation of responsibilities

Keep these responsibilities separate:

### Provider client

Responsible for:

- Constructing provider requests.
- Applying authentication.
- Setting timeouts.
- Parsing provider responses.
- Translating provider errors.
- Returning provider-specific data to the service layer.

### Application service

Responsible for:

- Reading user preferences.
- Selecting requested assets.
- Calling provider clients.
- Applying cache and fallback behavior.
- Normalizing data.
- Returning application-level results.

### API route

Responsible for:

- Authentication.
- Request validation.
- Calling the service.
- Returning a response.

Do not put all HTTP, business, and route logic in one function.

## Suggested backend structure

Follow the existing repository structure when present.

For a new FastAPI backend, prefer:

```text
backend/app/
├── api/
│   └── routes/
│       └── market.py
├── clients/
│   ├── coingecko.py
│   └── crypto_news.py
├── core/
│   └── config.py
├── schemas/
│   └── market.py
├── services/
│   └── market_service.py
└── data/
    └── fallback_news.json
```

Possible tests:

```text
backend/tests/
├── clients/
│   ├── test_coingecko_client.py
│   └── test_crypto_news_client.py
├── services/
│   └── test_market_service.py
└── api/
    └── test_market_routes.py
```

Do not reorganize a working repository only to match this example.

## Supported-asset catalog

Maintain one controlled catalog of supported assets.

Example:

```json
[
  {
    "id": "bitcoin",
    "symbol": "BTC",
    "name": "Bitcoin"
  },
  {
    "id": "ethereum",
    "symbol": "ETH",
    "name": "Ethereum"
  },
  {
    "id": "solana",
    "symbol": "SOL",
    "name": "Solana"
  },
  {
    "id": "cardano",
    "symbol": "ADA",
    "name": "Cardano"
  },
  {
    "id": "dogecoin",
    "symbol": "DOGE",
    "name": "Dogecoin"
  }
]
```

Rules:

- Store the provider's stable asset identifier in user preferences.
- Validate selections during onboarding.
- Reuse the same catalog throughout the application.
- Do not accept arbitrary asset IDs from the frontend.
- Do not construct provider requests from unvalidated input.
- Keep display names separate from provider identifiers.

## Coin-price integration

Retrieve price information for the authenticated user's selected assets.

Recommended internal coin-price response:

```json
{
  "id": "bitcoin",
  "symbol": "BTC",
  "name": "Bitcoin",
  "price_usd": 112000,
  "change_24h_percent": 2.4,
  "market_cap_usd": 2200000000000,
  "image_url": "https://example.com/bitcoin.png",
  "last_updated": "2026-08-25T16:55:00Z",
  "source": "coingecko",
  "is_stale": false
}
```

Not every provider field is mandatory.

For the MVP, prioritize:

- Stable asset ID.
- Symbol.
- Display name.
- Current USD price.
- 24-hour percentage change.
- Last-updated time when available.
- Source information.
- Stale-data indication.

## Coin-price validation

Before sending a request:

1. Read selected assets from the authenticated user's preferences.
2. Confirm that every asset is supported.
3. Remove duplicates while preserving a deterministic order.
4. Apply a reasonable maximum number of assets.
5. Build the provider request using validated IDs.

After receiving a response:

1. Validate that the response has the expected structure.
2. Handle missing requested assets.
3. Parse numbers safely.
4. Preserve `0` as a valid numeric value.
5. Reject impossible response types.
6. Avoid crashing when an optional field is missing.
7. Return results in a deterministic order.

Do not silently invent a price for a missing asset.

## Market-news integration

Retrieve crypto market news relevant to the user's preferences.

Recommended internal news response:

```json
{
  "id": "provider-article-id",
  "title": "Example crypto market headline",
  "summary": "Short optional summary",
  "url": "https://news-provider.example/article",
  "published_at": "2026-08-25T15:30:00Z",
  "source_name": "Example Source",
  "related_assets": [
    "bitcoin",
    "ethereum"
  ],
  "image_url": null,
  "data_source": "cryptopanic",
  "is_fallback": false
}
```

Rules:

- Return only the fields the frontend needs.
- Prefer news connected to selected assets.
- Preserve the original article URL.
- Treat article titles and summaries as untrusted external text.
- Do not render external HTML directly.
- Do not claim that an article is relevant when no relevance signal exists.
- Keep the external provider name separate from the article publisher.

## News personalization

Use selected assets to filter or rank news.

Preferred behavior:

```text
User preferences
        ↓
Selected asset identifiers
        ↓
Map identifiers to provider-supported symbols or filters
        ↓
Request or filter relevant news
        ↓
Return normalized articles
```

If the provider cannot filter by all selected assets:

1. Retrieve a limited general crypto-news set.
2. Rank articles using safe text matching or provider metadata.
3. Prefer articles connected to selected assets.
4. Keep high-quality general market news as a fallback.
5. Do not use an LLM solely to filter every news request unless justified.

## API-key rules

Read external-service credentials from environment variables.

Possible variables:

```env
COINGECKO_API_KEY=
CRYPTOPANIC_API_KEY=
```

Exact names may follow the existing project convention.

Rules:

- Keep keys on the backend.
- Never expose keys in frontend bundles.
- Never commit real keys.
- Never print complete keys in logs.
- Use placeholders in `.env.example`.
- Treat keys as optional only when a documented fallback exists.
- Fail clearly for required configuration.
- Do not silently use an unrelated provider.

## HTTP client rules

Use a reusable HTTP client suitable for the project's synchronous or
asynchronous architecture.

For asynchronous FastAPI services, prefer an asynchronous client such as:

```text
httpx.AsyncClient
```

Configure:

- Base URL.
- Headers.
- Authentication.
- Connection timeout.
- Read timeout.
- Response-size expectations where practical.
- Connection reuse.
- Controlled lifecycle.

Do not create an unmanaged new HTTP client for every small operation if the
project has a reusable application lifecycle.

Do not mix blocking HTTP calls into asynchronous endpoints without a clear
reason.

## Timeout policy

Every external request must have a finite timeout.

A reasonable initial policy may include:

```text
Connection timeout: a few seconds
Read timeout: several seconds
```

Select exact values based on the provider and deployed environment.

Do not allow an external provider to keep the dashboard request open
indefinitely.

When a timeout occurs:

1. Log the provider and general failure category.
2. Do not log secrets.
3. Attempt permitted cache or fallback behavior.
4. Return a controlled result.

## Retry policy

Retries may be useful for temporary network or server failures.

Retry only when the request is safe to repeat.

Possible retry cases:

- Connection interruption.
- Temporary timeout.
- Selected `5xx` provider failures.
- A rate-limit response only when a suitable delay is available.

Do not retry:

- Invalid API keys.
- Invalid request parameters.
- Most client errors.
- Responses known to be permanently rejected.

Use a small retry count.

Avoid retry storms and long dashboard delays.

Fallback is preferable to excessive retries.

## Cache strategy

External data does not need to be requested again on every page refresh.

Recommended initial cache behavior:

| Data | Example cache duration |
|---|---|
| Coin prices | Short, such as 30–120 seconds |
| Market news | Several minutes |
| Fallback news | Local and immediately available |

The exact duration must be configurable or clearly documented.

Possible MVP cache options:

1. In-memory cache for a single backend instance.
2. Redis if the existing project already uses it.
3. Database cache only when persistence is genuinely needed.

Prefer a simple in-memory cache for the initial coding task unless deployment
architecture requires shared caching.

Explain the limitation:

```text
An in-memory cache is local to one backend process and is cleared on restart.
```

Do not introduce Redis solely to make the architecture look more complex.

## Cache keys

Build deterministic cache keys.

Examples:

```text
prices:usd:bitcoin,ethereum
news:bitcoin,ethereum
news:general
```

Normalize and sort asset identifiers before creating keys when order should
not create separate cache entries.

Do not include:

- JWTs
- Passwords
- API keys
- Personal data unrelated to the requested content

## Stale-data behavior

For prices, cached data may be returned temporarily when the live provider
fails.

If stale data is returned, mark it explicitly:

```json
{
  "is_stale": true,
  "last_updated": "2026-08-25T16:52:00Z"
}
```

The frontend should communicate this honestly.

Do not label old data as current.

Define a maximum acceptable stale period.

Once cached data is too old, return an unavailable state instead of pretending
it is live.

## News fallback

Maintain a curated local fallback file.

Suggested location:

```text
backend/app/data/fallback_news.json
```

Example:

```json
[
  {
    "id": "fallback-market-basics-1",
    "title": "Understanding crypto market volatility",
    "summary": "Crypto prices can move quickly. Review longer-term context and avoid treating a single movement as a guaranteed trend.",
    "url": null,
    "published_at": null,
    "source_name": "Crypto Advisor",
    "related_assets": [],
    "image_url": null
  }
]
```

Fallback rules:

- Use educational, time-insensitive content.
- Do not include fabricated current events.
- Do not attach a fake publication date.
- Mark every fallback item:

```json
{
  "data_source": "static_fallback",
  "is_fallback": true
}
```

- Keep fallback content appropriate for a financial-information application.
- Do not present fallback content as live breaking news.

## Partial-failure behavior

One provider failure must not break the entire dashboard.

Correct behavior:

```text
Prices succeed + News fails
        ↓
Return prices
        ↓
Return fallback news
        ↓
Mark news as fallback
```

Another example:

```text
Prices fail + News succeeds
        ↓
Return news
        ↓
Return price section as unavailable or stale
        ↓
Keep remaining dashboard sections functional
```

Avoid returning one uncontrolled `500` response for the entire dashboard when
only one optional provider fails.

## Recommended API endpoints

Use separate endpoints when that keeps responsibilities clear:

```text
GET /api/market/prices
GET /api/market/news
```

Possible combined endpoint:

```text
GET /api/dashboard
```

A combined dashboard endpoint may orchestrate the individual services.

Do not duplicate provider logic between separate and combined endpoints.

## Authentication and preferences

Personalized market endpoints should require authentication.

Expected flow:

```text
Authenticated request
        ↓
Resolve current user
        ↓
Load user preferences
        ↓
Read interested_assets
        ↓
Call market services
```

Do not accept a `user_id` supplied by the frontend.

Do not allow query parameters to bypass the user's saved selections unless
the product explicitly supports temporary filtering.

If onboarding is incomplete, return a controlled response or direct the
frontend to onboarding.

## Internal response envelope

Use a consistent response structure.

Example prices response:

```json
{
  "items": [
    {
      "id": "bitcoin",
      "symbol": "BTC",
      "name": "Bitcoin",
      "price_usd": 112000,
      "change_24h_percent": 2.4,
      "last_updated": "2026-08-25T16:55:00Z",
      "source": "coingecko",
      "is_stale": false
    }
  ],
  "status": "live",
  "generated_at": "2026-08-25T16:55:05Z"
}
```

Example news response:

```json
{
  "items": [
    {
      "id": "article-123",
      "title": "Example headline",
      "summary": null,
      "url": "https://example.com/article",
      "published_at": "2026-08-25T15:30:00Z",
      "source_name": "Example Publisher",
      "related_assets": [
        "bitcoin"
      ],
      "data_source": "cryptopanic",
      "is_fallback": false
    }
  ],
  "status": "live",
  "generated_at": "2026-08-25T16:55:05Z"
}
```

Possible statuses:

```text
live
cached
stale
fallback
unavailable
partial
```

Keep status meanings documented and consistent.

## Numeric data rules

Use appropriate numeric types internally.

Rules:

- Do not parse financial numbers through binary floating-point when exact
  database persistence requires decimals.
- For display-only provider values, follow the project's serialization
  convention consistently.
- Do not round values prematurely in the backend.
- Let the frontend format display precision.
- Preserve negative percentage changes.
- Preserve zero values.
- Handle missing values separately from zero.
- Do not attach currency symbols to numeric JSON fields.

Correct:

```json
{
  "price_usd": 112000.25
}
```

Avoid:

```json
{
  "price_usd": "$112,000.25"
}
```

## External URL safety

Treat provider URLs as untrusted input.

Before returning or rendering URLs:

- Accept only expected URL schemes such as HTTPS.
- Do not render returned HTML.
- Use safe link behavior in the frontend.
- Consider opening external articles in a new tab.
- Add appropriate `rel` attributes when using `target="_blank"`.
- Do not proxy arbitrary user-provided URLs through the backend.

## Logging

Log enough information to diagnose integrations.

Useful fields:

- Provider name.
- Operation name.
- General status.
- Response status code.
- Duration.
- Cache hit or miss.
- Fallback use.
- Request correlation ID when available.

Do not log:

- Complete API keys.
- Authorization headers.
- JWT access tokens.
- Complete sensitive provider responses.
- User passwords.
- Database credentials.

## Error categories

Translate provider-specific failures into application-level errors.

Suggested categories:

```text
provider_timeout
provider_rate_limited
provider_unauthorized
provider_bad_response
provider_unavailable
configuration_missing
data_unavailable
```

Do not expose provider stack traces directly to the frontend.

## Implementation workflow

### Step 1: Inspect the project

Before making changes:

1. Inspect user-preference storage.
2. Inspect supported asset definitions.
3. Inspect configuration management.
4. Inspect existing HTTP clients.
5. Inspect service modules.
6. Inspect API routes.
7. Inspect response schemas.
8. Inspect cache utilities.
9. Inspect fallback data.
10. Inspect frontend data-fetching code.
11. Inspect tests.
12. Inspect `.env.example`.
13. Inspect current uncommitted changes.

Do not overwrite unrelated user work.

### Step 2: Verify provider requirements

Before coding against a provider:

1. Read its current official API documentation.
2. Confirm the correct base URL.
3. Confirm authentication requirements.
4. Confirm query parameters.
5. Confirm response fields.
6. Confirm free-tier behavior.
7. Confirm rate limits when documented.
8. Record important assumptions.

Do not rely only on old tutorials or remembered API formats.

### Step 3: Explain the implementation

Before modifying code, explain:

- Which providers will be used.
- Which user preferences affect each request.
- What internal response format will be returned.
- What timeout and cache behavior will apply.
- What happens when each provider fails.
- Which files will change.
- How provider calls will be tested without depending on live services.

### Step 4: Implement provider clients

Create focused clients for:

```text
CoinGecko
Crypto news provider
```

Each client should:

- Accept validated parameters.
- Apply required credentials.
- Set a timeout.
- Check response status.
- Parse the response.
- Validate essential fields.
- Raise controlled provider exceptions.
- Avoid application-specific UI decisions.

### Step 5: Implement application services

The service layer should:

1. Load selected user assets.
2. Build provider requests.
3. Read and write cache.
4. Call provider clients.
5. Normalize results.
6. Apply fallback behavior.
7. Preserve partial successes.
8. Return application-level data.

### Step 6: Implement API routes

Routes should:

- Require authentication when personalized.
- Resolve the current user.
- Call the application service.
- Return validated response schemas.
- Avoid provider-specific logic.
- Return controlled failures.

### Step 7: Connect the frontend

The frontend should:

- Call the application backend.
- Display loading states.
- Display price values consistently.
- Display positive and negative changes clearly.
- Display news titles and sources.
- Indicate fallback or stale data.
- Keep unaffected sections visible after partial failure.
- Provide a retry action when useful.

### Step 8: Run tests

Run:

- Provider-client unit tests.
- Service tests.
- API tests.
- Frontend integration tests.
- Manual verification against live APIs when configuration permits.

Do not make automated tests depend only on live external services.

## Required price tests

Test at least:

- Valid provider response is normalized.
- Only selected supported assets are requested.
- Duplicate asset IDs are removed.
- Unsupported asset IDs are rejected.
- Missing optional provider fields do not crash the service.
- Missing requested asset is handled.
- Zero price or change values are preserved.
- Negative percentage change is preserved.
- Provider timeout is handled.
- Provider `4xx` is handled.
- Provider `5xx` is handled.
- Invalid JSON is handled.
- Unexpected response shape is handled.
- Fresh cache prevents an unnecessary provider call.
- Stale cache is marked accurately.
- Excessively stale data is not presented as live.

## Required news tests

Test at least:

- Valid provider response is normalized.
- News is filtered or ranked using selected assets.
- Missing optional article fields do not crash the service.
- Unsafe or unsupported URLs are handled.
- Provider timeout activates fallback.
- Provider rate limit activates fallback.
- Missing API configuration activates fallback when intended.
- Fallback content is marked clearly.
- Fallback content is not presented as current breaking news.
- Duplicate articles are removed.
- Article ordering is deterministic.

## Required API tests

Test at least:

- Unauthenticated personalized request is rejected.
- Authenticated user receives data for their preferences.
- One user cannot request another user's personalized data.
- Incomplete onboarding is handled clearly.
- Partial provider failure does not break all content.
- Response matches the documented schema.
- Secrets never appear in responses.

## Manual verification

When the application can run:

1. Log in with a user who selected Bitcoin and Ethereum.
2. Request coin prices.
3. Confirm only selected assets are returned.
4. Confirm values are current when the provider succeeds.
5. Request market news.
6. Confirm relevant articles are preferred.
7. Refresh the dashboard.
8. Confirm cache behavior avoids unnecessary requests.
9. Simulate or configure a news-provider failure.
10. Confirm fallback news appears.
11. Confirm fallback content is labeled.
12. Simulate a price-provider failure.
13. Confirm other dashboard content remains available.
14. Confirm no API key appears in browser requests or responses.
15. Confirm error messages remain understandable.

## Security checklist

Before marking the integration complete, verify:

- [ ] Provider credentials exist only on the backend.
- [ ] Real credentials are excluded from Git.
- [ ] `.env.example` contains placeholders only.
- [ ] User-supplied asset IDs are validated.
- [ ] External requests have finite timeouts.
- [ ] Retries are limited.
- [ ] External HTML is not rendered directly.
- [ ] External URLs are handled safely.
- [ ] Provider errors do not expose internal details.
- [ ] API keys and JWTs are not logged.
- [ ] Personalized endpoints use the authenticated user.
- [ ] Partial failure does not break the full dashboard.
- [ ] Stale and fallback data are labeled honestly.

## Scope control

Do not add these features unless explicitly requested:

- Real-time WebSocket price streaming.
- Cryptocurrency trading.
- Portfolio synchronization.
- Wallet integration.
- Paid market-data providers.
- High-frequency price storage.
- Large historical-price databases.
- Complex message queues.
- Redis solely for appearance.
- Web scraping without clear permission.
- Multiple interchangeable providers before the main integration works.

Focus on a reliable free-tier MVP.

## Required explanation after implementation

After completing an integration task, report:

1. Which provider was integrated.
2. What data is requested.
3. How user preferences affect the request.
4. How provider data is normalized.
5. What timeout is used.
6. What cache strategy is used.
7. What fallback behavior exists.
8. How partial failures are handled.
9. Which files changed.
10. Which tests were run.
11. Any free-tier limitation.
12. Anything that could not be verified.

Explain technical concepts in plain language.

Do not provide only a list of files or API endpoints.

## Completion criteria

The crypto-data integration is complete only when:

- Selected coin prices can be retrieved.
- News can be retrieved or replaced by a valid fallback.
- Provider responses are converted into stable internal schemas.
- User preferences affect returned content.
- Arbitrary asset IDs are rejected.
- External requests have timeouts.
- Cache behavior is defined.
- Fallback and stale data are labeled.
- One provider failure does not break the whole dashboard.
- Provider credentials remain private.
- Automated tests use mocked provider responses.
- Live behavior is manually verified when configuration permits.
- The implementation is clearly explained.

If any requirement cannot be tested, mark it as `not_verified` and explain
why.

If `$ARGUMENTS` specifies an integration area, focus on that area while
checking its effect on personalization, caching, fallback behavior, and the
dashboard.
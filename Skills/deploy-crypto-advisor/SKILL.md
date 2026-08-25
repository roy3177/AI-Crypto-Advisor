---
name: deploy-crypto-advisor
description: Deploy, configure, verify, troubleshoot, or review the production environment for the Moveo AI Crypto Advisor. Use when working on Vercel, Render, Railway, managed PostgreSQL, production builds, environment variables, CORS, database migrations, startup commands, health checks, public URLs, deployment logs, CI/CD, or production smoke tests. Inspect the repository, current deployment configuration, provider documentation, and existing environments before making changes.
argument-hint: "[frontend|backend|database|environment|cors|migrations|verify|troubleshoot]"
disable-model-invocation: false
---

# Deploy the Moveo AI Crypto Advisor

Deploy and verify the complete Moveo AI Crypto Advisor.

The final application must be:

- Publicly accessible.
- Connected to a persistent database.
- Configured with production environment variables.
- Free of committed secrets.
- Able to register and authenticate users.
- Able to save onboarding preferences.
- Able to display the four dashboard sections.
- Able to store user feedback.
- Able to survive external-service failures through fallback behavior.

Deployment is not complete merely because a provider reports a successful
build.

The application must be tested through its public URL.

## Preferred deployment architecture

Use the existing confirmed deployment setup when one already exists.

For a new deployment, prefer:

```text
Frontend → Vercel
Backend  → Render or Railway
Database → Managed PostgreSQL
```

Possible flow:

```text
Public browser
      ↓
Vercel frontend
      ↓ HTTPS
FastAPI backend
      ↓
Managed PostgreSQL
```

External backend integrations:

```text
FastAPI
├── CoinGecko
├── Crypto news provider
└── AI provider
```

Use free services or free tiers as required by the assignment.

Before selecting or configuring a provider:

1. Read its current official documentation.
2. Confirm its current free-tier availability.
3. Confirm current build and runtime requirements.
4. Confirm persistent database behavior.
5. Confirm environment-variable configuration.
6. Confirm sleeping, cold-start, or usage limitations.
7. Do not rely on outdated deployment tutorials.

## Deployment objectives

The deployment must include:

1. A production frontend build.
2. A production backend service.
3. A persistent PostgreSQL database.
4. Applied database migrations.
5. Configured frontend-to-backend communication.
6. Correct production CORS.
7. Secure production secrets.
8. External API configuration.
9. A public health check.
10. Public smoke testing.
11. Deployment documentation.
12. Safe database-review access.

## Pre-deployment inspection

Before modifying deployment configuration:

1. Inspect the repository structure.
2. Identify frontend and backend roots.
3. Inspect package manager files.
4. Inspect Python dependency files.
5. Inspect start commands.
6. Inspect build commands.
7. Inspect Dockerfiles when present.
8. Inspect environment-variable usage.
9. Inspect `.env.example`.
10. Inspect Alembic configuration.
11. Inspect CORS configuration.
12. Inspect API base-URL configuration.
13. Inspect health endpoints.
14. Inspect existing provider files.
15. Inspect existing CI/CD workflows.
16. Inspect current uncommitted changes.

Do not overwrite an existing valid deployment configuration without
explaining why.

## Local production verification

Before deployment, verify the application locally using production-like
commands.

### Frontend

Verify:

```text
Install dependencies
Run linting
Run type checking
Run tests
Create production build
Start or preview production build
```

Do not rely only on the development server.

### Backend

Verify:

```text
Install production dependencies
Run backend tests
Apply migrations to a disposable database
Start FastAPI with the production server command
Call the health endpoint
Call relevant API endpoints
```

### Database

Verify:

```text
Create empty test database
Apply all migrations
Confirm tables and constraints
Run integration tests
```

Do not deploy known failing code.

## Environment variables

Maintain one documented source of expected environment variables.

The repository must include:

```text
.env.example
```

The repository must not include:

```text
.env
.env.local
.env.production
```

when they contain real secrets.

Recommended backend variables:

```env
ENVIRONMENT=production
DATABASE_URL=postgresql+psycopg://user:password@host:5432/database
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=https://your-frontend-domain.example
CORS_ORIGINS=https://your-frontend-domain.example
AI_PROVIDER=openrouter
AI_API_KEY=replace-with-ai-provider-key
AI_MODEL=replace-with-current-free-tier-model
COINGECKO_API_KEY=
CRYPTOPANIC_API_KEY=
APP_TIMEZONE=Asia/Jerusalem
```

Recommended frontend variable:

```env
VITE_API_BASE_URL=https://your-backend-domain.example
```

or, for Next.js:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.example
```

Use the naming convention appropriate to the selected frontend framework.

## Secret rules

Real secrets must exist only in:

- Local ignored environment files.
- Deployment-provider secret settings.
- Approved private secret storage.

Never:

- Commit secrets.
- Put backend API keys in public frontend variables.
- Put JWT secrets in frontend code.
- Print secrets in build logs.
- Include production credentials in screenshots.
- Include database credentials in README files.
- Return configuration values from public endpoints.

Before deployment, search the repository for accidentally committed secrets.

Do not print secret values during the search.

If a real secret was committed:

1. Remove it from current code.
2. Rotate it.
3. Review whether history cleanup is required.
4. Do not treat deletion from the latest file as sufficient.

## Frontend deployment

Configure:

- Correct project root.
- Correct install command.
- Correct build command.
- Correct output configuration.
- Public backend URL.
- Framework routing.
- SPA fallback when needed.
- Production environment variables.

For a Vite React application, typical concepts include:

```text
Build command → npm run build
Output directory → dist
```

For Next.js, use the provider's supported Next.js configuration.

Inspect actual scripts in `package.json`.

Do not guess commands when the repository defines them.

## Frontend routing

Ensure direct navigation works for routes such as:

```text
/login
/signup
/onboarding
/dashboard
```

For a client-side SPA, configure route fallback so refreshing `/dashboard`
does not return a hosting-provider 404.

For Next.js, use framework-native routing.

Test direct public navigation to every important route.

## Frontend API URL

The frontend must use the public backend origin in production.

Correct:

```text
https://crypto-advisor-api.example.com
```

Incorrect production value:

```text
http://localhost:8000
```

Centralize the base URL in the API client.

Do not hardcode different backend URLs throughout frontend components.

Fail clearly when the production API URL is missing.

## Backend deployment

Configure:

- Correct backend root directory.
- Python runtime.
- Dependency installation.
- Start command.
- Host binding.
- Provider-assigned port.
- Health check.
- Environment variables.
- Database connection.
- Migration strategy.

Typical FastAPI server concept:

```text
uvicorn app.main:app --host 0.0.0.0 --port <provider-port>
```

Use the actual module path.

Use the port supplied by the deployment provider.

Do not hardcode a local-only port when the provider requires an environment
port.

## Production server

For a small free-tier MVP, Uvicorn may be sufficient.

Use a worker configuration appropriate to:

- Available memory.
- Database connection limits.
- Free-tier resource limits.
- In-memory cache behavior.

Remember:

```text
Multiple workers
    → Separate in-memory caches
```

Do not configure unnecessary workers that exceed free-tier limits.

Do not use development reload mode in production.

## Health endpoint

Provide a lightweight endpoint:

```text
GET /health
```

Recommended response:

```json
{
  "status": "ok"
}
```

The basic health endpoint should not:

- Return secrets.
- Return database credentials.
- Call every external provider.
- Generate an AI insight.
- Perform expensive work.

A separate readiness check may test essential dependencies when required.

Keep health checks fast and reliable.

## Database deployment

Use a persistent managed PostgreSQL database.

Verify:

- Connection string.
- TLS or SSL requirements.
- Network access.
- Database name.
- Driver compatibility.
- Connection limits.
- Persistence policy.
- Backup or recovery limitations of the free tier.

Do not use a local SQLite file on an ephemeral backend filesystem for
production unless persistence is explicitly guaranteed.

## Database URL handling

Deployment providers may supply different PostgreSQL URL schemes.

The application may receive:

```text
postgres://...
```

while the selected SQLAlchemy driver may require:

```text
postgresql+psycopg://...
```

Normalize the connection URL in one controlled configuration location only
when necessary.

Do not expose the normalized URL in logs.

Do not repeat URL replacement logic across the application.

## Migration strategy

Every production schema change must use Alembic migrations.

Possible deployment strategies:

### Pre-deploy migration command

Preferred when the provider supports it:

```text
alembic upgrade head
```

### Controlled release command

Run migrations once before starting the new version.

### Startup migration

Acceptable for a small MVP only when carefully controlled.

Risks:

- Multiple instances may run the migration concurrently.
- Migration failure may prevent application startup.
- Destructive changes may be risky.

Do not run schema creation through:

```python
Base.metadata.create_all()
```

as a replacement for production migrations.

Before applying production migrations:

1. Confirm the target database.
2. Review the migration.
3. Confirm it contains no unintended destructive changes.
4. Confirm upgrade order.
5. Confirm required environment variables.
6. Record the expected Alembic revision.

Never test downgrade against production.

## CORS configuration

Allow the real public frontend origin.

Example:

```text
https://crypto-advisor.vercel.app
```

Do not use:

```text
*
```

with credentialed requests in production.

Configure:

- Allowed origins.
- Allowed methods.
- Allowed headers.
- Credential behavior according to the authentication strategy.

Read origins from environment configuration.

Normalize trailing slashes consistently.

Test browser preflight requests.

## HTTPS and mixed content

Both public services should use HTTPS.

A public HTTPS frontend cannot reliably call an HTTP backend because browsers
block mixed content.

Verify:

```text
HTTPS frontend → HTTPS backend
```

Do not put HTTP API URLs in production frontend settings.

## Cookie-specific configuration

If authentication uses HttpOnly cookies:

- Set `Secure` in production.
- Set an appropriate `SameSite` value.
- Configure frontend requests with credentials.
- Configure backend CORS credentials.
- Review cross-site cookie restrictions.
- Add CSRF protection when required by the selected architecture.

If authentication uses bearer tokens:

- Attach the token through the authorization header.
- Do not mix cookie configuration into the flow unintentionally.

Document the selected strategy.

## External provider configuration

Configure:

- CoinGecko credentials if currently required.
- News-provider credentials.
- AI-provider credentials.
- Current free-tier model.
- Provider timeouts.
- Cache durations.
- Fallback behavior.

The dashboard must remain partially usable if optional providers fail.

Do not delay deployment solely because the news API is unavailable when a
valid static fallback exists.

## Startup behavior

The backend must fail clearly when essential configuration is missing.

Essential configuration usually includes:

- Database URL.
- JWT secret.

Optional integrations may degrade safely when:

- News key is missing.
- AI provider is temporarily unavailable.
- Optional CoinGecko key is missing and public access remains supported.

Do not silently start with:

- An insecure JWT secret.
- An unintended local database.
- A production frontend origin of `localhost`.

## Logging

Production logs should include:

- Startup success or failure.
- Environment name.
- General database connectivity status.
- Request correlation information.
- Provider failure categories.
- Fallback usage.
- Migration status.

Production logs must not include:

- Database URL.
- Database password.
- JWT secret.
- Complete JWT.
- AI API key.
- News API key.
- User passwords.
- Authorization headers.

## Deployment workflow

### Step 1: Verify repository readiness

Run:

- Backend tests.
- Frontend tests.
- Linting.
- Type checking.
- Production builds.
- Migration checks.
- Secret scanning using available safe tools.

Stop if required checks fail.

### Step 2: Prepare the database

1. Create or identify the managed PostgreSQL service.
2. Confirm it is not a production database from another project.
3. Add the database URL to backend secrets.
4. Test connection safely.
5. Apply migrations.
6. Confirm expected revision.
7. Do not expose credentials.

### Step 3: Deploy the backend

1. Configure backend root.
2. Configure install command.
3. Configure start command.
4. Configure environment variables.
5. Configure health check.
6. Deploy.
7. Inspect build logs.
8. Inspect runtime logs.
9. Call `/health`.
10. Verify migrations.

### Step 4: Deploy the frontend

1. Configure frontend root.
2. Configure framework and build.
3. Configure public backend URL.
4. Deploy.
5. Inspect build logs.
6. Open the public URL.
7. Test direct routes.

### Step 5: Finalize CORS

After the frontend receives its public URL:

1. Add the exact origin to backend CORS configuration.
2. Redeploy the backend if required.
3. Verify preflight requests.
4. Verify login from the real frontend.

Do not leave temporary unrestricted CORS enabled.

### Step 6: Configure external providers

Add provider keys through private deployment settings.

Test:

- Prices.
- News or news fallback.
- AI insight or AI fallback.
- Meme content.

### Step 7: Run public smoke tests

Test the complete public flow.

### Step 8: Document deployment

Record:

- Public frontend URL.
- Public backend URL.
- Health endpoint.
- API documentation URL.
- Selected hosting providers.
- Required environment-variable names.
- Deployment commands.
- Migration procedure.
- Known free-tier limitations.

Do not document secret values.

## Public smoke test

Use a new test user.

Verify:

1. Frontend public URL loads.
2. Signup works.
3. Login works.
4. JWT or cookie authentication works.
5. Onboarding appears for a new user.
6. Preferences save.
7. Dashboard loads.
8. Four required sections appear.
9. Selected coin prices appear.
10. News or fallback appears.
11. Daily AI insight or fallback appears.
12. Financial disclaimer appears.
13. Meme appears.
14. All four sections support feedback.
15. Feedback remains after refresh.
16. Logout works.
17. Login works again.
18. Returning user opens the dashboard.
19. Direct navigation to `/dashboard` works.
20. Mobile layout works.
21. No browser CORS errors appear.
22. No mixed-content errors appear.
23. No secrets appear in browser responses.

## API smoke test

Verify public backend behavior:

```text
GET /health
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me
PUT /api/preferences/me
GET /api/dashboard
PUT /api/feedback
```

Use a test account.

Do not print complete access tokens in shared logs or reports.

Verify correct behavior for:

- Missing authentication.
- Invalid authentication.
- Invalid request bodies.
- External provider failure.
- Database persistence.

## Database persistence test

Verify:

1. Register a user.
2. Complete onboarding.
3. Submit feedback.
4. Restart or redeploy the backend safely.
5. Log in again.
6. Confirm the user still exists.
7. Confirm preferences still exist.
8. Confirm feedback still exists.

This proves the application is not relying on ephemeral local storage.

Do not restart a shared production service destructively without confirming
scope.

## Deployment failure diagnosis

When deployment fails, classify it.

Possible categories:

```text
Build failure
Dependency failure
Wrong root directory
Wrong start command
Missing environment variable
Database connection failure
Migration failure
CORS failure
Frontend routing failure
Provider failure
Free-tier limitation
Runtime crash
Health-check failure
```

For each failure, report:

```text
Observed error:
Affected service:
Confirmed evidence:
Likely cause:
Proposed fix:
Verification step:
```

Do not make unrelated configuration changes before identifying the failure.

## Common deployment checks

### Backend cannot start

Check:

- Module path.
- Start command.
- Required port binding.
- Python version.
- Dependencies.
- Required environment variables.
- Database connection.
- Migration state.

### Frontend cannot call backend

Check:

- Public API base URL.
- HTTPS.
- CORS origin.
- Authentication headers or credentials.
- Backend runtime status.
- Browser network response.

### Login works locally but fails publicly

Check:

- JWT secret configuration.
- Cookie settings if used.
- CORS.
- HTTPS.
- API base URL.
- Database migration.
- Email normalization.
- Frontend authentication storage.

### Database tables are missing

Check:

- Correct production database.
- Alembic configuration.
- Migration command.
- Migration logs.
- Current Alembic revision.

Do not solve missing migrations by manually creating inconsistent tables.

## Free-tier considerations

Document relevant limitations such as:

- Backend sleeping after inactivity.
- Cold-start delay.
- Database storage limit.
- Monthly runtime limit.
- API request limits.
- AI model availability.
- Provider rate limits.
- Deployment bandwidth limits.

Design the UI to tolerate a cold backend:

- Show a clear loading state.
- Use a reasonable request timeout.
- Avoid immediately sending many duplicate requests.

Do not promise uninterrupted production-grade availability on a free tier.

## CI/CD recommendation

CI/CD is a useful improvement.

A simple GitHub Actions workflow may run:

```text
Backend lint and tests
Frontend lint and tests
Frontend production build
```

Deployment may remain provider-connected to the GitHub branch.

Do not add Kubernetes, EKS, Terraform, or a complex pipeline solely for this
coding task.

If CI/CD is added:

- Use repository secrets.
- Never print secrets.
- Pin or review action versions.
- Fail on meaningful test errors.
- Keep the workflow understandable.

## Database reviewer access

The assignment requests access to the database.

Do not publish production database credentials.

Prefer:

1. A protected read-only reviewer page.
2. A documented demo account.
3. A temporary read-only database user shared privately.
4. A local seeded database setup.

A small protected reviewer endpoint may display:

- User ID.
- Onboarding completion.
- Preferences.
- Insight date.
- Feedback section and vote.

It must not display:

- Password hash.
- Email unless necessary.
- JWTs.
- API keys.
- Database credentials.
- Private provider data.

Document how the reviewer can verify persistence safely.

## Rollback planning

Before a meaningful production change:

- Know the last working deployment.
- Know how to redeploy it.
- Review database migration compatibility.
- Avoid destructive schema changes for the MVP.
- Preserve a safe path back when possible.

Never perform a destructive database rollback without explicit authorization
and a verified backup strategy.

## Security checklist

Before finalizing deployment, verify:

- [ ] Real secrets are absent from Git.
- [ ] Production uses a strong JWT secret.
- [ ] Database credentials are private.
- [ ] Provider keys are backend-only.
- [ ] Frontend contains only public configuration.
- [ ] Production CORS uses expected origins.
- [ ] Public services use HTTPS.
- [ ] Debug mode is disabled.
- [ ] Raw stack traces are not public.
- [ ] Development reload is disabled.
- [ ] Database migrations are applied.
- [ ] Password hashes are never returned.
- [ ] Reviewer access is read-only or appropriately protected.
- [ ] Logs contain no complete tokens or secrets.

## Required deployment report

After deployment, report:

1. Frontend deployment status.
2. Backend deployment status.
3. Database migration status.
4. Public frontend URL.
5. Public backend URL.
6. Health endpoint result.
7. API documentation URL when enabled.
8. CORS verification.
9. Public signup and login result.
10. Onboarding persistence result.
11. Dashboard result.
12. Feedback persistence result.
13. External provider status.
14. Fallback verification.
15. Known free-tier limitations.
16. Anything that remains `not_verified`.

Do not expose secret values in the report.

## Completion criteria

Deployment is complete only when:

- The frontend is publicly accessible.
- The backend is publicly accessible.
- The health endpoint succeeds.
- PostgreSQL is persistent.
- All migrations are applied.
- Frontend calls the public backend.
- Production CORS works.
- Signup and login work publicly.
- Onboarding saves publicly.
- All four dashboard sections appear.
- Feedback persists.
- External failures have controlled fallbacks.
- Direct frontend routes work.
- HTTPS is used.
- No real secrets are committed or exposed.
- Public smoke tests pass.
- Deployment instructions are documented.
- Database-review access is safe and explained.

If any requirement cannot be verified, mark it as `not_verified` and explain
why.

If `$ARGUMENTS` specifies a deployment area, focus on that area while checking
its effect on security, persistence, configuration, migrations, public access,
and the complete user flow.
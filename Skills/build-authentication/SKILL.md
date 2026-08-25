---
name: build-authentication
description: Build, review, test, or modify authentication for the Moveo AI Crypto Advisor. Use when working on user signup, login, password hashing, JWT access tokens, current-user dependencies, protected FastAPI endpoints, frontend authentication state, logout, authentication errors, or authentication tests. Inspect the existing user model, security configuration, API routes, and frontend auth flow before making changes.
argument-hint: "[signup|login|jwt|frontend|tests|review]"
disable-model-invocation: false
---

# Build Crypto Advisor Authentication

Build and maintain secure authentication for the Moveo AI Crypto Advisor.

The authentication system must support:

1. User registration with name, email, and password.
2. Secure password hashing.
3. Login with email and password.
4. JWT access-token creation.
5. JWT validation.
6. Identification of the authenticated user.
7. Protection of private API endpoints.
8. Logout behavior on the frontend.
9. Safe authentication error responses.
10. Automated authentication tests.

Use the existing project architecture and naming conventions when they are
already established.

For a new implementation, prefer:

- FastAPI
- PostgreSQL
- SQLAlchemy
- Pydantic
- bcrypt-compatible password hashing
- JWT access tokens
- React or Next.js with TypeScript

Do not implement OAuth, social login, refresh tokens, email verification, or
password recovery unless explicitly requested.

## Authentication flow

### Registration flow

```text
User submits name, email, and password
        ↓
Backend validates the request
        ↓
Backend normalizes the email
        ↓
Backend checks whether the email already exists
        ↓
Backend hashes the password
        ↓
Backend creates the user
        ↓
onboarding_completed remains false
        ↓
Backend returns a safe user response
```

### Login flow

```text
User submits email and password
        ↓
Backend normalizes the email
        ↓
Backend finds the user
        ↓
Backend verifies the password
        ↓
Backend creates a signed JWT access token
        ↓
Backend returns the token and safe user data
```

### Protected request flow

```text
Frontend sends authenticated request
        ↓
Authorization: Bearer <access-token>
        ↓
Backend decodes and validates the JWT
        ↓
Backend reads the user identifier
        ↓
Backend loads the active user
        ↓
Protected endpoint continues
```

## Required API endpoints

Use these routes unless the existing API already follows a different
consistent convention:

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

Optional route:

```text
POST /api/auth/logout
```

A backend logout endpoint is not required when using a stateless bearer token
without server-side token storage.

In that case, logout means deleting the token and user authentication state
from the frontend.

## User model requirements

The user model should include at least:

| Field | Purpose |
|---|---|
| `id` | Primary identifier |
| `name` | User display name |
| `email` | Unique login identifier |
| `password_hash` | Secure password representation |
| `onboarding_completed` | Determines the post-login route |
| `is_active` | Allows account disabling |
| `created_at` | Account creation time |
| `updated_at` | Last update time |

Rules:

- Enforce email uniqueness in the database.
- Normalize emails before queries and storage.
- Never store plaintext passwords.
- Never return `password_hash` in API responses.
- Set `onboarding_completed` to `false` for new users.
- Set `is_active` to `true` for new users.
- Do not trust user-controlled values for server-managed fields.

## Request and response schemas

Create separate Pydantic schemas for separate responsibilities.

Recommended schemas:

```text
UserSignupRequest
UserLoginRequest
UserResponse
TokenResponse
AuthenticatedUserResponse
```

### Signup request

Expected shape:

```json
{
  "name": "Roy Meoded",
  "email": "roy@example.com",
  "password": "example-password"
}
```

Validate:

- `name` is not blank.
- `name` has a reasonable maximum length.
- `email` is valid.
- `password` satisfies the selected password policy.
- Unexpected sensitive fields are ignored or rejected deliberately.

### Login request

Expected shape:

```json
{
  "email": "roy@example.com",
  "password": "example-password"
}
```

### Token response

Recommended shape:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "user-id",
    "name": "Roy Meoded",
    "email": "roy@example.com",
    "onboarding_completed": false
  }
}
```

Do not include:

- Password
- Password hash
- JWT secret
- Internal database errors
- Unnecessary private information

## Password security

Use a password-hashing library that supports bcrypt or another appropriate
adaptive password-hashing algorithm.

Provide two focused functions:

```python
hash_password(password: str) -> str
verify_password(plain_password: str, password_hash: str) -> bool
```

Rules:

- Never encrypt passwords using reversible encryption.
- Never store plaintext passwords.
- Never log passwords.
- Never send passwords back to the frontend.
- Never manually implement a password-hashing algorithm.
- Never use a general-purpose fast hash such as SHA-256 alone for passwords.
- Let the selected password-hashing library manage salts.
- Handle malformed stored hashes safely.

Keep password logic in a dedicated security module.

Suggested location:

```text
backend/app/core/security.py
```

## Password policy

For this coding task, use a clear and practical password policy.

Recommended minimum:

- At least 8 characters.
- At most 128 characters.
- Must not consist only of whitespace.

Do not add excessively complicated password rules unless requested.

Apply the same validation rules consistently during signup.

Explain the selected password policy to the user.

## Email handling

Normalize email addresses before storing or querying them.

At minimum:

```text
Trim surrounding whitespace
Convert to lowercase
```

Example:

```text
" Roy@Example.com " → "roy@example.com"
```

Keep database-level uniqueness as the final protection against duplicate
accounts.

An application-level existence check alone is not sufficient because two
requests may arrive concurrently.

Handle the database unique-constraint failure safely.

## JWT payload

Use a minimal JWT payload.

Recommended claims:

```json
{
  "sub": "user-id",
  "type": "access",
  "iat": 1787680800,
  "exp": 1787684400
}
```

Meanings:

- `sub`: The user identifier.
- `type`: The token type.
- `iat`: The token creation time.
- `exp`: The token expiration time.

Rules:

- Store the user ID in `sub`.
- Convert identifier types consistently.
- Include an expiration time.
- Validate the signature.
- Validate the expiration time.
- Validate the expected token type.
- Use an explicitly configured JWT algorithm.
- Do not place passwords or sensitive personal data inside the token.
- Do not treat JWT contents as secret merely because they are encoded.

## JWT configuration

Read JWT configuration from environment variables.

Recommended variables:

```env
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
```

The public `.env.example` must contain placeholders only.

The real JWT secret must:

- Remain outside Git.
- Be sufficiently long and random.
- Be different between development and production.
- Not be printed in logs.
- Not be sent to the frontend.

Fail clearly during application startup when required production
configuration is missing.

Do not silently use an insecure production default.

## JWT functions

Keep token logic in the security layer.

Recommended functions:

```python
create_access_token(subject: str) -> str
decode_access_token(token: str) -> TokenPayload
```

`create_access_token` should:

1. Resolve the current UTC time.
2. Add `sub`.
3. Add `type`.
4. Add `iat`.
5. Add `exp`.
6. Sign using the configured secret and algorithm.

`decode_access_token` should:

1. Verify the signature.
2. Verify expiration.
3. Verify the token type.
4. Verify that `sub` exists.
5. Return validated payload data.
6. Convert JWT-library errors into one safe authentication error.

Do not spread JWT encoding and decoding logic across multiple routes.

## Current-user dependency

Create one reusable FastAPI dependency for protected endpoints.

Recommended behavior:

```text
Read bearer credentials
        ↓
Decode and validate token
        ↓
Read subject
        ↓
Load user from database
        ↓
Verify that user exists
        ↓
Verify that user is active
        ↓
Return authenticated User object
```

Suggested interface:

```python
get_current_user(...)
```

Protected routes should depend on this function rather than manually decoding
tokens in every endpoint.

Example conceptual usage:

```python
current_user: User = Depends(get_current_user)
```

Never accept a user ID from the frontend as proof of identity.

For user-owned data, always use the authenticated user's ID.

## Signup endpoint

The signup endpoint must:

1. Validate input.
2. Normalize the email.
3. Check for an existing account.
4. Hash the password.
5. Create the user.
6. Set onboarding as incomplete.
7. Commit the transaction.
8. Refresh or reload the created user.
9. Return a safe response.

Use an appropriate success status such as:

```text
201 Created
```

For an existing email, return a controlled conflict response such as:

```text
409 Conflict
```

Do not reveal private information about existing accounts beyond what the
product requires.

If user creation fails:

1. Roll back the transaction.
2. Do not leave partial data.
3. Do not return the raw database exception.

## Login endpoint

The login endpoint must:

1. Normalize the submitted email.
2. Find the user by normalized email.
3. Verify the submitted password.
4. Reject inactive accounts.
5. Create an access token.
6. Return the token and safe user data.

Use one generic error for an incorrect email or password.

Recommended response:

```text
Invalid email or password
```

Do not reveal whether:

- The email exists.
- Only the password was incorrect.

Use:

```text
401 Unauthorized
```

Include the appropriate authentication header when consistent with the
framework's bearer authentication behavior.

## Current-user endpoint

The `/api/auth/me` endpoint must:

1. Require authentication.
2. Load the user using `get_current_user`.
3. Return safe user data.
4. Include `onboarding_completed`.

Example response:

```json
{
  "id": "user-id",
  "name": "Roy Meoded",
  "email": "roy@example.com",
  "onboarding_completed": false
}
```

The frontend will use `onboarding_completed` to determine the next route.

## Post-login routing

After successful login:

```text
onboarding_completed = false
        ↓
Navigate to /onboarding
```

```text
onboarding_completed = true
        ↓
Navigate to /dashboard
```

Do not decide this based only on frontend state.

Use the value returned by the authenticated backend.

The backend remains the source of truth.

## Frontend authentication state

Use a dedicated authentication layer.

Recommended responsibilities:

- Store the access token according to the chosen strategy.
- Store or retrieve the current user.
- Add the bearer token to authenticated API requests.
- Expose login state.
- Expose loading state.
- Handle login.
- Handle signup.
- Handle logout.
- Restore authentication when the application loads.
- Redirect unauthenticated users away from protected pages.
- Redirect authenticated users based on onboarding status.

Possible components:

```text
AuthProvider
useAuth
ProtectedRoute
API client
Login form
Signup form
```

Follow the existing frontend architecture when one exists.

Do not duplicate token handling in every component.

## Token storage decision

Choose one consistent token-storage strategy.

For a simple coding-assignment MVP, a bearer access token may be stored by the
frontend and attached to API requests.

When using browser storage:

- Explain the XSS tradeoff.
- Never place the token in a URL.
- Never log the token.
- Remove it during logout.
- Keep access-token lifetime limited.
- Avoid rendering untrusted HTML.
- Restore the authenticated user through `/api/auth/me`.

For stronger browser security, an HttpOnly secure cookie may be used.

When using a cookie:

- Configure `HttpOnly`.
- Configure `Secure` in production.
- Configure an appropriate `SameSite` value.
- Configure CORS deliberately.
- Consider CSRF protection when cross-site requests are possible.

Do not mix cookie authentication and bearer-token authentication accidentally.

Inspect the existing implementation and select one complete strategy.

Document the selected strategy and its tradeoff.

## API client behavior

Create one centralized frontend API client.

It should:

1. Read the current token when required.
2. Attach:

```http
Authorization: Bearer <access-token>
```

3. Preserve normal unauthenticated requests.
4. Handle `401 Unauthorized` consistently.
5. Clear invalid authentication state.
6. Redirect to login when appropriate.
7. Avoid infinite redirect or retry loops.

Do not manually construct the authorization header in every React component.

## Protected frontend routes

Protect at least:

```text
/onboarding
/dashboard
```

Expected behavior:

| Situation | Destination |
|---|---|
| No valid authentication | `/login` |
| Logged in, onboarding incomplete | `/onboarding` |
| Logged in, onboarding complete | `/dashboard` |
| Authentication is still loading | Loading state |

Do not redirect before the initial authentication check finishes.

Otherwise, the application may briefly display the wrong page or create a
redirect loop.

## CORS requirements

Configure CORS based on known frontend origins.

Development example:

```text
http://localhost:3000
http://localhost:5173
```

Production example:

```text
https://your-frontend-domain.vercel.app
```

Rules:

- Do not use unrestricted production origins with credentials.
- Read allowed origins from configuration.
- Keep development and production settings separate.
- Allow only required methods and headers where practical.
- Verify preflight requests.

## Error responses

Use consistent, safe errors.

Recommended behavior:

| Condition | Status |
|---|---:|
| Invalid signup input | `422` or `400` |
| Email already registered | `409` |
| Invalid login credentials | `401` |
| Missing access token | `401` |
| Invalid access token | `401` |
| Expired access token | `401` |
| Inactive user | `403` |
| Unexpected backend failure | `500` |

Do not expose:

- Stack traces
- Password data
- JWT secrets
- SQL statements
- Database URLs
- Internal exception details

Keep user-facing messages understandable.

## Logging rules

Authentication logs may include:

- Event type
- Request identifier
- Timestamp
- Safe user identifier after successful identification
- General failure category

Authentication logs must not include:

- Plaintext password
- Password hash
- Complete JWT
- JWT secret
- Authorization header
- Database credentials

Avoid logging whether a particular email exists during a failed login.

## Rate-limiting consideration

Rate limiting is a useful security improvement but is not mandatory for the
initial assignment.

If implemented, apply it primarily to:

```text
POST /api/auth/signup
POST /api/auth/login
```

Do not delay mandatory project features solely to build complex distributed
rate limiting.

Mention the absence of rate limiting as a production consideration when
appropriate.

## Authentication implementation workflow

### Step 1: Inspect existing code

Before making changes:

1. Inspect the user model.
2. Inspect database migrations.
3. Inspect Pydantic schemas.
4. Inspect existing authentication routes.
5. Inspect the security module.
6. Inspect application configuration.
7. Inspect FastAPI dependencies.
8. Inspect frontend auth state.
9. Inspect the API client.
10. Inspect existing tests.
11. Inspect `.env.example`.
12. Inspect current uncommitted changes.

Do not overwrite unrelated user work.

### Step 2: Explain the plan

Before implementation, explain:

- The selected token strategy.
- How passwords will be stored.
- What the JWT contains.
- How protected endpoints identify the user.
- How post-login navigation works.
- Which files will change.
- How the feature will be tested.

Keep the explanation concise and in plain language.

### Step 3: Implement backend security utilities

Implement:

- Password hashing.
- Password verification.
- Access-token creation.
- Token decoding and validation.
- Authentication exceptions.
- Current-user resolution.

Keep these concerns separate from route handlers.

### Step 4: Implement authentication schemas

Implement request and response validation.

Verify that no response schema contains:

```text
password
password_hash
JWT_SECRET_KEY
```

### Step 5: Implement authentication routes

Implement:

```text
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me
```

Keep route handlers thin.

Move reusable business logic into a service layer when the project uses one.

### Step 6: Implement frontend authentication

Implement:

- Signup page.
- Login page.
- Auth state.
- Central API client.
- Protected routes.
- Logout.
- Authentication restoration.
- Post-login routing.

Include clear loading and error states.

### Step 7: Run tests

Run backend and frontend authentication tests.

Also perform an end-to-end manual verification when the application can run.

Do not claim the feature works based only on static code inspection.

## Required backend tests

Test at least:

### Signup

- Valid signup creates a user.
- Email is normalized.
- Password is stored as a hash.
- Plaintext password is not stored.
- Duplicate email is rejected.
- Invalid email is rejected.
- Blank name is rejected.
- Short password is rejected.
- New user has `onboarding_completed = false`.
- Response does not contain `password_hash`.

### Login

- Valid credentials return an access token.
- Incorrect password is rejected.
- Unknown email is rejected.
- Email comparison uses normalization.
- Inactive user is rejected.
- Response does not reveal why credentials were invalid.

### JWT

- Valid token is accepted.
- Missing token is rejected.
- Invalid signature is rejected.
- Expired token is rejected.
- Token without `sub` is rejected.
- Token with the wrong type is rejected.
- Token for a missing user is rejected.
- Token for an inactive user is rejected.

### Protected endpoints

- Authenticated user can access `/api/auth/me`.
- Unauthenticated request cannot access `/api/auth/me`.
- One user cannot access another user's private data by changing a request ID.

## Required frontend tests

Test at least:

- Signup form validation.
- Login form validation.
- Successful login updates authentication state.
- Failed login displays a safe error.
- Protected page redirects an unauthenticated user.
- Authentication loading state prevents premature redirects.
- Logout removes authentication state.
- Incomplete onboarding redirects to onboarding.
- Completed onboarding redirects to the dashboard.
- A `401` response clears invalid authentication state.

## Manual verification

When the application can run, verify this complete flow:

1. Register a new user.
2. Confirm the database contains a password hash.
3. Confirm the database does not contain the plaintext password.
4. Confirm duplicate registration is rejected.
5. Log in with the correct password.
6. Confirm a JWT is returned or the selected secure cookie is created.
7. Call `/api/auth/me`.
8. Confirm the returned user is correct.
9. Confirm `onboarding_completed` is `false`.
10. Confirm the frontend navigates to onboarding.
11. Log out.
12. Confirm the protected page is no longer accessible.
13. Attempt login with an incorrect password.
14. Confirm a safe error is displayed.

## Security review checklist

Before marking authentication complete, verify:

- [ ] Passwords are hashed using a trusted library.
- [ ] Plaintext passwords are never stored.
- [ ] Passwords and tokens are not logged.
- [ ] Emails are normalized.
- [ ] Email uniqueness exists in the database.
- [ ] JWTs have expiration times.
- [ ] JWT signatures are validated.
- [ ] JWT type is validated.
- [ ] JWT secret is loaded from the environment.
- [ ] No insecure production secret fallback exists.
- [ ] Protected endpoints use `get_current_user`.
- [ ] User identity is not trusted from frontend input.
- [ ] Inactive users are rejected.
- [ ] Private fields are excluded from responses.
- [ ] CORS is configured for known origins.
- [ ] Frontend logout removes authentication state.
- [ ] Authentication tests pass.
- [ ] No real secrets are committed.

## Scope control

Do not add these features unless explicitly requested:

- Google login
- GitHub login
- Other social login
- Multi-factor authentication
- Email verification
- Password reset email
- Refresh-token rotation
- Device management
- Role-based administration
- Enterprise identity providers
- Authentication microservices

These may be mentioned as future production improvements, but they must not
delay the required Moveo MVP.

## Required explanation after implementation

After completing an authentication task, report:

1. What was implemented.
2. How registration works.
3. How password hashing works.
4. How login works.
5. What the JWT contains.
6. How protected endpoints identify the user.
7. How the frontend stores authentication state.
8. How routing uses `onboarding_completed`.
9. Which files changed.
10. Which tests were run.
11. Any remaining security consideration.
12. Anything that could not be verified.

Explain technical concepts in plain language.

Do not provide only a list of files or commands.

## Completion criteria

Authentication is complete only when:

- Registration works.
- Login works.
- Passwords are securely hashed.
- Duplicate accounts are prevented.
- JWT access tokens expire and are validated.
- `/api/auth/me` returns the authenticated user.
- Private endpoints reject unauthenticated requests.
- Private responses do not expose password data.
- Frontend authentication state works.
- Post-login routing respects onboarding status.
- Logout removes frontend authentication state.
- Automated tests pass.
- The complete flow has been manually verified when possible.
- No secrets are committed.
- The implementation is clearly explained.

If any requirement cannot be tested, mark it as `not_verified` and explain
why.

If `$ARGUMENTS` specifies an authentication area, focus on that area while
checking its effect on the complete authentication flow.
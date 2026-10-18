# TaskBoard – React Todo Management App

React 18 + Vite, Material UI v5, Axios, React Router v6.
Features: login, register (with single and multi-select fields), protected routes, dashboard statistics,
table CRUD with search, sorting, filtering, pagination, inline status/priority changes.

## Install and run
```bash
npm install
cp .env.example .env      # already included
npm run dev               # http://localhost:5173
npm run build             # production build in /dist
```
Mock mode (default) needs no backend. Demo login: `demo@example.com` / `Demo@1234`.
Mock data lives in `localStorage` (clear it to reset).

## Switching to your real API
1. Set `.env`: `VITE_USE_MOCK=false` and `VITE_API_BASE_URL=https://your-api/api`
2. Implement the contracts below. No component changes are needed: only `src/services/authService.js`
   and `src/services/todoService.js` choose between mock and real, and the `real*` objects are already wired to Axios.

## Project structure
```
src/
  services/  http.js (Axios + interceptors) · tokenStore.js · authService.js · todoService.js · mockDb.js
  context/   AuthContext.jsx
  components/ Layout · ProtectedRoute (+GuestRoute) · TodoFormDialog · Chips
  pages/     Login · Register · Dashboard · Todos
  utils/     validation.js · constants.js
```

## API contracts
All bodies are JSON. Protected routes require `Authorization: Bearer <accessToken>`.
Errors: `{ "message": "Human readable", "errors": { "fieldName": "Field message" } }` (`errors` optional).

### POST /auth/register
Request:
```json
{ "fullName": "Asha Rao", "email": "asha@example.com", "phone": "+919876543210", "country": "India",
  "role": "Developer", "interests": ["Work","Learning"], "notifications": ["Email","Push"],
  "password": "Str0ng@Pass", "confirmPassword": "Str0ng@Pass", "terms": true }
```
201 response:
```json
{ "user": { "id": "u_1", "fullName": "Asha Rao", "email": "asha@example.com", "phone": "+919876543210",
  "country": "India", "role": "Developer", "interests": ["Work","Learning"], "notifications": ["Email","Push"] },
  "accessToken": "<jwt>" }
```
Errors: 400 validation, 409 `{ "message": "Email already registered", "errors": { "email": "This email is already in use" } }`

### POST /auth/login
Request `{ "email": "...", "password": "..." }` → 200 same shape as register. 401 on bad credentials (use one generic message).

### GET /auth/me → 200 `{ "user": { ... } }`  (401 if token invalid/expired)
### POST /auth/logout → 200 `{}` (clear refresh cookie, revoke refresh token)

### GET /todos
Query: `page` (1-based), `limit`, `search`, `status` (todo|in_progress|done), `priority` (low|medium|high),
`sortBy` (title|status|priority|dueDate|createdAt), `order` (asc|desc).
```json
{ "data": [ { "id": "t_1", "title": "Prepare demo", "description": "Slides", "status": "in_progress",
  "priority": "high", "dueDate": "2026-10-20", "createdAt": "2026-10-15T08:00:00Z", "updatedAt": "2026-10-15T08:00:00Z" } ],
  "total": 42, "page": 1, "limit": 10 }
```
Sort `priority` by rank (low < medium < high), not alphabetically.

### GET /todos/stats
```json
{ "total": 12, "byStatus": { "todo": 5, "in_progress": 3, "done": 4 },
  "byPriority": { "low": 4, "medium": 4, "high": 4 }, "overdue": 2 }
```
`overdue` = dueDate before today and status ≠ done.

### POST /todos
Request `{ "title", "description", "status", "priority", "dueDate": "YYYY-MM-DD" | "" }` → 201 the created todo.
### PATCH /todos/:id
Partial body (e.g. `{ "status": "done" }`) → 200 updated todo. 404 if not found or owned by someone else.
### DELETE /todos/:id → 200 `{}` (or 204)

## Validation rules (enforce again on the server)
| Field | Rule |
|---|---|
| email | valid format, unique, case-insensitive, trimmed |
| password | 8+ chars with upper, lower, digit, special |
| phone | 10–15 digits, optional leading `+` |
| fullName | 2+ chars |
| interests / notifications | at least one value each, from the allowed lists |
| todo.title | 3–120 chars |
| todo.description | max 500 chars |
| status / priority | must be one of the enum values |

## Authentication security considerations
- **Hash passwords** on the server with Argon2id or bcrypt (cost ≥ 12). The mock stores plaintext only because it is fake: never copy that.
- **Token storage:** the access token (short-lived, 10–15 min) is held in memory and mirrored to `sessionStorage` only so refresh survives. `localStorage` is avoided because any XSS can read it. Best practice: store a **refresh token in an httpOnly, Secure, SameSite=Strict/Lax cookie** (Axios already sends `withCredentials: true`), rotate it on each use, and add an `/auth/refresh` call in the Axios 401 interceptor.
- **Authorization is a server job.** Route guards in React only improve UX. Every `/todos` query must filter by the authenticated user's id (prevents IDOR).
- **HTTPS everywhere**, HSTS, and a strict CORS allow-list (never `*` with credentials).
- **Rate-limit** login/register, add lockout or CAPTCHA after repeated failures, and return one generic message for bad credentials to prevent user enumeration.
- **CSRF:** if you use cookies for refresh, use SameSite plus a CSRF token or custom header check.
- **XSS:** React escapes output; never use `dangerouslySetInnerHTML` with user text. Add a Content-Security-Policy header.
- **Validate and sanitize** on the server (client validation is convenience only), use parameterized queries, and set request size limits.
- **Logout** should revoke the refresh token server-side. The Axios interceptor already clears state on any 401.
- Keep dependencies updated (`npm audit`) and never put secrets in `VITE_*` variables: they are public in the bundle.

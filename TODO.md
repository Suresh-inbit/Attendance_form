# Project TODO

## High-Impact Fixes
- [ ] Align `attendanceDate` storage/querying (date-only or range queries) for consistency and timezone safety.
- [ ] Fix `/list-all` sort field to use `attendanceDate` (currently `currentDate`).
- [ ] Fix `setCloseAttendance` response handling (backend returns `{ success, message }`, frontend expects `state`).
- [ ] Use `window.location.origin` for QR/form URL generation to avoid mixed-content issues on HTTPS.

## Security & Access Control
- [ ] Protect admin/maintenance endpoints (`/attendance/delete`, `/sync-from-sheet`, `/sheet-preview`, `/test-sheets`, `/toggle/*`) with auth or a secret token.
- [ ] Add rate limiting (e.g., `express-rate-limit`) for write endpoints.
- [ ] Add `helmet` and tighten CORS configuration.

## Data Integrity & Validation
- [ ] Align roll number validation rules between frontend and backend.
- [ ] Validate `optionalField` (length/allowed chars) server-side.
- [ ] Add schema-level validation for `name` (trim, min length).

## Google Sheets Integration
- [ ] Move sheet ID/name to environment variables.
- [ ] Avoid logging sensitive env details in `/test-sheets`.
- [ ] Add robust handling for missing/malformed sheet columns.

## Frontend Quality & UX
- [ ] Remove unused `axios` import or switch to axios consistently.
- [ ] Remove/guard `window.setCloseAttendance` exposure in production.
- [ ] Add clipboard fallback and clearer error UI on QR page.
- [ ] Add empty/error states for admin/list pages.

## API Design
- [ ] Standardize API response shape (`{ success, data, message }`).
- [ ] Add pagination for `/list-all`.

## Project Hygiene
- [ ] Expand `README.md` with setup, env vars, and run steps.
- [ ] Add `.env.example` for frontend and backend.
- [ ] Add tests (API integration + basic frontend validation).

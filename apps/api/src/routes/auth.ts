// Superseded by routes/invite.ts.
//
// Login / signup / guest / logout / password-reset are all owned by Better Auth at
// /api/auth/*. The invite flow moved to a public GET /v1/invite/:code (details) plus
// an authed POST /v1/invite/attach (bind the new account to its school/cohort) —
// the account + session are created by Better Auth's normal sign-up, so the cookie
// is set the same way as every other login.
export {};

# Changelog

## 2.1.0

`Lang` type value for Turkmen changed from `'tk'` to `'tm'` (matches the
platform's internal language-code convention). This is a type-level
change only — the API itself remains backward compatible: sending the
old `'tk'` string still works at runtime (the server falls back to
Turkmen for any unrecognized `lang` value), so existing integrations
keep working. TypeScript users passing the literal `'tk'` should update
to `'tm'` to satisfy the type checker.

## 2.0.0

**Breaking change:** normal API error responses no longer throw.

Previously, `sendOtp()` / `verifyOtp()` threw `OtpSanlyError` for *every*
non-success response — including an invalid/inactive API key, a wrong or
expired code, and rate limiting. That meant a bad API key on the caller's
side surfaced as an unhandled exception (often a 500) instead of a normal,
catchable result.

Now:
- Normal API errors (`400`, `401`, `403`, `429`, `5xx`) are returned as a
  regular object: `{ success: false, status, error }`. Check
  `result.success` / `result.status` with a plain `if`.
- `OtpSanlyError` is thrown **only** for transport-level failures — no
  network connection, DNS failure, or a response that isn't JSON at all.

### Migration from 1.x

```ts
// Before (1.x)
try {
  const result = await sanly.sendOtp({ phone })
} catch (err) {
  if (err instanceof OtpSanlyError) { /* handled everything here */ }
}

// After (2.x)
const result = await sanly.sendOtp({ phone })
if (!result.success) {
  // result.status: 401/403 = bad API key, 400 = bad input, 429 = rate limited
} else {
  // ...
}
```

See the README's "Error handling" section for the full pattern.

## 1.0.1 and earlier

See git history.

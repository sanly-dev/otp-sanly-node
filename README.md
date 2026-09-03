# OTP Sanly — Node.js / TypeScript SDK

[Türkmençe](README.tk.md) | [Русский](README.ru.md) | English

Official SDK for [OTP Sanly](https://otp.sanly.dev) — SMS & Email OTP authentication for Turkmenistan.

## Install

```bash
npm install otp-sanly
```

## Quick start

```ts
import { OtpSanly } from 'otp-sanly'

const sanly = new OtpSanly({ apiKey: process.env.OTP_API_KEY! })

// Send an OTP
const sent = await sanly.sendOtp({
  phone: '+99361234567', // Turkmenistan numbers only for SMS. Use `email` instead for worldwide delivery.
  project: 'My App',
  lang: 'ru', // 'tm' | 'ru' | 'en' — which language to send the OTP in
})
console.log(sent.otpId, sent.message)

// Verify the code the user entered
const verified = await sanly.verifyOtp({
  phone: '+99361234567',
  code: '123456',
})
if (verified.success) {
  // proceed — the code was correct
}
```

## Sandbox mode

Create a **sandbox** API key in your [dashboard](https://otp.sanly.dev/dashboard/api-keys) to test your integration
for free, without sending real SMS/email. The OTP code is returned directly in the response:

```ts
const sent = await sanly.sendOtp({ phone: '+99361234567' })
console.log(sent.code) // only present for sandbox keys
```

## Error handling

Starting with `v2`, normal API errors (invalid API key, wrong code, too
many attempts) are **not thrown** — they're returned as a regular
`{ success:false, status, error }` object, so you can branch on `status`:

```ts
const result = await sanly.sendOtp({ phone: '+99361234567' })

if (!result.success) {
  if (result.status === 401 || result.status === 403) {
    // Your API key is invalid, inactive, or out of balance — a config issue
  } else if (result.status === 400) {
    // The user supplied bad input (malformed phone/email)
  } else if (result.status === 429) {
    // Too many attempts — retry later
  } else {
    // Unexpected server-side error (5xx)
  }
  console.error(result.status, result.error)
  return
}
```

`OtpSanlyError` is thrown only for **network-level failures** (no
internet, DNS failure, response isn't JSON at all) — catch those with
`try/catch`:

```ts
import { OtpSanly, OtpSanlyError } from 'otp-sanly'

try {
  const result = await sanly.sendOtp({ phone: '+99361234567' })
  if (!result.success) { /* see the status check above */ }
} catch (err) {
  if (err instanceof OtpSanlyError) {
    console.error('Network error:', err.message)
  }
}
```

> **Upgrading from `v1`:** the previous version threw for every error,
> including normal API errors. Now only network-level failures throw —
> always check `result.success` once you have a response.

## Full API reference

See [https://otp.sanly.dev/developers](https://otp.sanly.dev/developers) for the complete API reference, webhook docs,
and framework-specific examples in other languages.

## License

MIT

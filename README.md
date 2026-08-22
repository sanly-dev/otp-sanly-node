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
  lang: 'ru', // 'tk' | 'ru' | 'en' — which language to send the OTP in
})
console.log(sent.otpId, sent.message)

// Verify the code the user entered
const verified = await sanly.verifyOtp({
  phone: '+99361234567',
  code: '123456',
})
if (verified.verified) {
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

Failed requests throw `OtpSanlyError`, which includes the HTTP status and the raw response body:

```ts
import { OtpSanly, OtpSanlyError } from 'otp-sanly'

try {
  await sanly.sendOtp({ phone: '+99361234567' })
} catch (err) {
  if (err instanceof OtpSanlyError) {
    console.error(err.status, err.message, err.body)
  }
}
```

## Full API reference

See [https://otp.sanly.dev/developers](https://otp.sanly.dev/developers) for the complete API reference, webhook docs,
and framework-specific examples in other languages.

## License

MIT

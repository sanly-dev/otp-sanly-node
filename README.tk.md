# OTP Sanly — Node.js / TypeScript SDK

[Türkmençe](README.tk.md) | [Русский](README.ru.md) | [English](README.md)

**OTP Sanly** (https://otp.sanly.dev) üçin resmi SDK — Türkmenistan üçin SMS & Email OTP tassyklama hyzmaty.

## Gurnamak

```bash
npm install otp-sanly
```

## Çalt başlamak

```ts
import { OtpSanly } from 'otp-sanly'

const sanly = new OtpSanly({ apiKey: process.env.OTP_API_KEY! })

// OTP iber
const sent = await sanly.sendOtp({
  phone: '+99361234567', // SMS üçin diňe Türkmenistan belgileri. Dünýäniň islendik ýerine ibermek üçin `email` ulanyň.
  project: 'Meniň Programmam',
  lang: 'ru', // 'tk' | 'ru' | 'en' — OTP-iň haýsy dilde ugradylmalydygy
})
console.log(sent.otpId, sent.message)

// Ulanyjynyň girizen kodyny barla
const verified = await sanly.verifyOtp({
  phone: '+99361234567',
  code: '123456',
})
if (verified.success) {
  // dowam et — kod dogry
}
```

## Sandbox (synag) rejimi

Dashboard-yňyzda (https://otp.sanly.dev/dashboard/api-keys) **sandbox** API açary döredip, integrasiýaňyzy
mugt synap görüp bilersiňiz — hakyky SMS/email ugradylmaýar. OTP kody göni jogapda gaýtarylýar:

```ts
const sent = await sanly.sendOtp({ phone: '+99361234567' })
console.log(sent.code) // diňe sandbox açarlarda bar bolýar
```

## Ýalňyşlyklary dolandyrmak

Şowsuz haýyşlar `OtpSanlyError`-y "taşlaýar" (throw), onda HTTP status kody we çig jogap bar:

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

## Doly API resminamasy

Doly API resminamasyny, webhook dokumentasiýasyny we beýleki dillerdäki mysallary şu ýerden görüň:
https://otp.sanly.dev/developers

## Ygtyýarnama

MIT

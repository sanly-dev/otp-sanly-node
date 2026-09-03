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
  lang: 'ru', // 'tm' | 'ru' | 'en' — OTP-iň haýsy dilde ugradylmalydygy
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

`v2`-den başlap, adaty API ýalňyşlyklary (nädogry API açar, nädogry kod, aşa
köp synanyşyk) **taşlanmaýar (throw edilmeýär)** — muňa derek adaty
`{ success:false, status, error }` obýekti gaýdyp gelýär, `status`
meýdançasyna görä ýalňyşlygyň görnüşini tapawutlandyryp bolýar:

```ts
const result = await sanly.sendOtp({ phone: '+99361234567' })

if (!result.success) {
  if (result.status === 401 || result.status === 403) {
    // API açaryňyz nädogry, işjeň däl ýa-da balans gutaran — konfigurasiýa meselesi
  } else if (result.status === 400) {
    // Ulanyjynyň iberen maglumaty nädogry (telefon/email formaty ýalňyş)
  } else if (result.status === 429) {
    // Aşa köp synanyşyk — birazdan gaýtadan synanyşyň
  } else {
    // Serwer tarapyndaky garaşylmadyk ýalňyşlyk (5xx)
  }
  console.error(result.status, result.error)
  return
}
```

`OtpSanlyError` diňe **ulgam derejesindäki** näsazlyklarda (internet ýok,
DNS işlänok, jogap düýbünden JSON däl) taşlanýar — bulary `try/catch` bilen
tutmaly:

```ts
import { OtpSanly, OtpSanlyError } from 'otp-sanly'

try {
  const result = await sanly.sendOtp({ phone: '+99361234567' })
  if (!result.success) { /* ýokardaky status barlagyny serediň */ }
} catch (err) {
  if (err instanceof OtpSanlyError) {
    console.error('Ulgam ýalňyşlygy:', err.message)
  }
}
```

> **`v1`-den geçýänler üçin:** öňki wersiýada ähli ýalňyşlyklar (şol
> sanda adaty API ýalňyşlyklary hem) taşlanýardy. Indi diňe ulgam
> derejesindäki näsazlyklar taşlanýar — API jogaby geleninde bolsa
> hemişe `result.success` barlaň.

## Doly API resminamasy

Doly API resminamasyny, webhook dokumentasiýasyny we beýleki dillerdäki mysallary şu ýerden görüň:
https://otp.sanly.dev/developers

## Ygtyýarnama

MIT

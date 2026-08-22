# OTP Sanly — Node.js / TypeScript SDK

[Türkmençe](README.tk.md) | Русский | [English](README.md)

Официальный SDK для [OTP Sanly](https://otp.sanly.dev) — сервис OTP-подтверждения по SMS и Email для Туркменистана.

## Установка

```bash
npm install otp-sanly
```

## Быстрый старт

```ts
import { OtpSanly } from 'otp-sanly'

const sanly = new OtpSanly({ apiKey: process.env.OTP_API_KEY! })

// Отправить OTP
const sent = await sanly.sendOtp({
  phone: '+99361234567', // Только туркменские номера для SMS. Для доставки в любую страну используйте `email`.
  project: 'Мой сервис',
  lang: 'ru', // 'tk' | 'ru' | 'en' — на каком языке отправить OTP
})
console.log(sent.otpId, sent.message)

// Проверить код, введённый пользователем
const verified = await sanly.verifyOtp({
  phone: '+99361234567',
  code: '123456',
})
if (verified.verified) {
  // продолжить — код верный
}
```

## Тестовый режим (sandbox)

Создайте **sandbox** API-ключ в личном кабинете (https://otp.sanly.dev/dashboard/api-keys), чтобы бесплатно
протестировать интеграцию — реальные SMS/email не отправляются. Код возвращается прямо в ответе:

```ts
const sent = await sanly.sendOtp({ phone: '+99361234567' })
console.log(sent.code) // доступно только для sandbox-ключей
```

## Обработка ошибок

Неудачные запросы выбрасывают `OtpSanlyError`, который содержит HTTP-статус и полное тело ответа:

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

## Полная документация API

Полное описание API, документацию по webhook и примеры на других языках см. здесь:
https://otp.sanly.dev/developers

## Лицензия

MIT

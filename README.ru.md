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
if (verified.success) {
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

Начиная с `v2`, обычные ошибки API (неверный API-ключ, неверный код,
слишком много попыток) **не выбрасываются (throw)** — вместо этого
возвращается обычный объект `{ success:false, status, error }`, по полю
`status` можно определить тип ошибки:

```ts
const result = await sanly.sendOtp({ phone: '+99361234567' })

if (!result.success) {
  if (result.status === 401 || result.status === 403) {
    // Ваш API-ключ неверен, неактивен или закончился баланс — проблема конфигурации
  } else if (result.status === 400) {
    // Пользователь ввёл некорректные данные (неверный формат телефона/email)
  } else if (result.status === 429) {
    // Слишком много попыток — повторите чуть позже
  } else {
    // Непредвиденная ошибка на сервере (5xx)
  }
  console.error(result.status, result.error)
  return
}
```

`OtpSanlyError` выбрасывается только при **сбоях на уровне сети**
(нет интернета, не работает DNS, ответ вообще не является JSON) —
их нужно ловить через `try/catch`:

```ts
import { OtpSanly, OtpSanlyError } from 'otp-sanly'

try {
  const result = await sanly.sendOtp({ phone: '+99361234567' })
  if (!result.success) { /* см. проверку status выше */ }
} catch (err) {
  if (err instanceof OtpSanlyError) {
    console.error('Сетевая ошибка:', err.message)
  }
}
```

> **Переход с `v1`:** в предыдущей версии выбрасывались все ошибки,
> включая обычные ошибки API. Теперь выбрасываются только сетевые
> сбои — всегда проверяйте `result.success` при получении ответа API.

## Полная документация API

Полное описание API, документацию по webhook и примеры на других языках см. здесь:
https://otp.sanly.dev/developers

## Лицензия

MIT

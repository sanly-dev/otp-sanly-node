import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { OtpSanly, OtpSanlyError } from '../src/index'

const originalFetch = globalThis.fetch

function mockFetch(status: number, body: unknown) {
  globalThis.fetch = (async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })) as typeof fetch
}

describe('OtpSanly constructor', () => {
  test('throws if apiKey is missing', () => {
    // @ts-expect-error intentionally omitting required field
    assert.throws(() => new OtpSanly({}))
  })

  test('constructs with a valid apiKey', () => {
    const sanly = new OtpSanly({ apiKey: 'otpsanly_test' })
    assert.ok(sanly instanceof OtpSanly)
  })
})

describe('sendOtp', () => {
  afterEach(() => { globalThis.fetch = originalFetch })

  test('throws if neither phone nor email is provided', async () => {
    const sanly = new OtpSanly({ apiKey: 'otpsanly_test' })
    await assert.rejects(() => sanly.sendOtp({}))
  })

  test('returns the parsed response on success', async () => {
    mockFetch(200, { success: true, otpId: 42, message: 'OTP SMS iberildi' })
    const sanly = new OtpSanly({ apiKey: 'otpsanly_test' })
    const result = await sanly.sendOtp({ phone: '+99361234567' })
    assert.equal(result.otpId, 42)
    assert.equal(result.success, true)
  })

  test('throws OtpSanlyError on API error response', async () => {
    mockFetch(403, { success: false, error: 'API açar işjeň däl. Töleg ediň' })
    const sanly = new OtpSanly({ apiKey: 'otpsanly_test' })
    await assert.rejects(
      () => sanly.sendOtp({ phone: '+99361234567' }),
      (err: unknown) => {
        assert.ok(err instanceof OtpSanlyError)
        assert.equal(err.status, 403)
        return true
      }
    )
  })
})

describe('verifyOtp', () => {
  afterEach(() => { globalThis.fetch = originalFetch })

  test('throws if code is missing', async () => {
    const sanly = new OtpSanly({ apiKey: 'otpsanly_test' })
    // @ts-expect-error intentionally omitting required field
    await assert.rejects(() => sanly.verifyOtp({ phone: '+99361234567' }))
  })

  test('throws if neither phone nor email is provided', async () => {
    const sanly = new OtpSanly({ apiKey: 'otpsanly_test' })
    await assert.rejects(() => sanly.verifyOtp({ code: '123456' }))
  })

  test('returns verified:true on success', async () => {
    mockFetch(200, { success: true, verified: true })
    const sanly = new OtpSanly({ apiKey: 'otpsanly_test' })
    const result = await sanly.verifyOtp({ phone: '+99361234567', code: '123456' })
    assert.equal(result.verified, true)
  })
})

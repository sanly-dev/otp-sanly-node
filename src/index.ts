/**
 * OTP Sanly — Official Node.js / TypeScript SDK
 * https://otp.sanly.dev/developers
 */

const DEFAULT_BASE_URL = 'https://otp.sanly.dev'

export type Lang = 'tm' | 'ru' | 'en'

export interface OtpSanlyOptions {
  /** Your API key (starts with "otpsanly_"). Get one at https://otp.sanly.dev/dashboard/api-keys */
  apiKey: string
  /** Override the base API URL. Defaults to https://otp.sanly.dev */
  baseUrl?: string
}

export interface SendOtpParams {
  /** Turkmenistan phone number, e.g. "+99361234567". Provide phone OR email, not both. */
  phone?: string
  /** Any valid email address, works worldwide. Provide phone OR email, not both. */
  email?: string
  /** Free-text label shown in your dashboard/webhooks (e.g. your site name). */
  project?: string
  /**
   * Which language to send the OTP in ("tm" | "ru" | "en"). Selects the
   * 3-language custom message/project label configured on your API key's
   * template. Defaults to "tm" if omitted.
   *
   * IMPORTANT: since this SDK calls the API server-to-server, the
   * Accept-Language HTTP header is unreliable — always pass `lang`
   * explicitly if you support multiple languages for your end users.
   */
  lang?: Lang
}

export interface SendOtpResult {
  success: boolean
  /** Numeric ID of the created OTP record — pass this to verifyOtp() as `otpId` for extra precision if needed. */
  otpId?: number
  /** The phone number or email address the OTP was sent to (echoed back). */
  target?: string
  /** Delivery channel actually used: "sms" | "sms_gateway" | "sms_sandbox" | "email". */
  channel?: string
  /** ISO 8601 UTC expiry timestamp. */
  expiresAt?: string
  /** Human-readable expiry timestamp in Turkmenistan local time (Asia/Ashgabat). */
  expiresAtTM?: string
  /** Seconds until the code expires. */
  expiresIn?: number
  /** How many OTPs remain in the API key's current plan/period after this one. */
  remainingOtp?: number
  /** Which attempt number this is (resending to the same target increments this). */
  attempt?: number
  /** Max verify attempts allowed for this code before it locks (currently 3). */
  maxAttempts?: number
  /** Whether the SMS was formatted for Android's WebOTP auto-read API (set on your API key's template). */
  autoRead?: boolean
  /** Human-readable status message (in Turkmen). */
  message?: string
  error?: string
  /**
   * HTTP status code — only present when `success` is `false`. Use this to
   * tell apart error categories:
   *  - `401` / `403` — invalid, inactive, or unauthorized API key (a
   *    configuration problem on your side, not the end user's fault)
   *  - `400` — bad request (e.g. malformed phone/email)
   *  - `429` — you're sending too many requests, rate-limited
   *  - `5xx` — a problem on the OTP Sanly server
   */
  status?: number
  /** Only present when using a sandbox API key — the code, returned directly for testing (no real SMS/email is sent). */
  code?: string
  sandbox?: boolean
}

export interface VerifyOtpParams {
  /** Same phone number used in sendOtp. */
  phone?: string
  /** Same email used in sendOtp. */
  email?: string
  /** The code the user entered. */
  code: string
  /** Optional — the otpId returned by sendOtp, for extra precision if you have multiple pending OTPs for the same target. */
  otpId?: number
}

export interface VerifyOtpResult {
  success: boolean
  /** Human-readable status message (in Turkmen). */
  message?: string
  /** Numeric ID of the OTP record that was verified. */
  otpId?: number
  /** The phone number or email address that was verified (echoed back). */
  target?: string
  /** ISO 8601 UTC timestamp of when verification succeeded. */
  verifiedAt?: string
  /** Human-readable verification timestamp in Turkmenistan local time (Asia/Ashgabat). */
  verifiedAtTM?: string
  /** Delivery channel the original OTP was sent through. */
  channel?: string
  /** The `project` label you passed to sendOtp(), if any. */
  project?: string
  error?: string
  /**
   * HTTP status code — only present when `success` is `false`. Use this to
   * tell apart error categories:
   *  - `401` / `403` — invalid, inactive, or unauthorized API key (a
   *    configuration problem on your side, not the end user's fault)
   *  - `400` — wrong/expired code entered by the user
   *  - `429` — too many verify attempts, rate-limited
   *  - `5xx` — a problem on the OTP Sanly server
   */
  status?: number
}

/**
 * Thrown only for transport-level failures — the request never reached the
 * server or the response could not be parsed at all (network outage, DNS
 * failure, timeout, etc). Normal API error responses (invalid API key,
 * wrong code, rate limiting, ...) are NOT thrown — they come back as a
 * regular result object with `success: false` and a `status` code so you
 * can branch on them with a plain `if`, no `try/catch` required.
 */
export class OtpSanlyError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'OtpSanlyError'
    this.status = status
    this.body = body
  }
}

export class OtpSanly {
  private apiKey: string
  private baseUrl: string

  constructor(options: OtpSanlyOptions) {
    if (!options?.apiKey) {
      throw new Error('OtpSanly: apiKey is required. Get one at https://otp.sanly.dev/dashboard/api-keys')
    }
    this.apiKey = options.apiKey
    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '')
  }

  /**
   * Sends the request. Only a transport-level failure (network outage, DNS
   * failure, response body isn't JSON at all) throws `OtpSanlyError`.
   * A normal API error response — invalid API key (401/403), bad input
   * (400), rate limiting (429), server error (5xx) — is returned as a
   * regular object with `success: false` and `status` set, so callers can
   * branch with a plain `if` instead of `try/catch`.
   */
  private async request<T extends { success?: boolean; status?: number }>(path: string, body: Record<string, unknown>): Promise<T> {
    let res: Response
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: this.apiKey, ...body }),
      })
    } catch (err) {
      throw new OtpSanlyError(err instanceof Error ? err.message : 'Network request failed', 0, null)
    }
    let data: any
    try {
      data = await res.json()
    } catch {
      throw new OtpSanlyError(`Server returned a non-JSON response (status ${res.status})`, res.status, null)
    }
    if (!res.ok || data?.success === false) {
      return { ...data, success: false, status: res.status } as T
    }
    return { ...data, status: res.status } as T
  }

  /**
   * Send an OTP via SMS (Turkmenistan numbers only) or email (worldwide).
   *
   * @example
   * ```ts
   * const sanly = new OtpSanly({ apiKey: process.env.OTP_API_KEY! })
   * const result = await sanly.sendOtp({ phone: '+99361234567', lang: 'ru' })
   * ```
   */
  async sendOtp(params: SendOtpParams): Promise<SendOtpResult> {
    if (!params.phone && !params.email) {
      throw new Error('OtpSanly.sendOtp: provide either "phone" or "email"')
    }
    return this.request<SendOtpResult>('/api/send-otp', params as unknown as Record<string, unknown>)
  }

  /**
   * Verify a code the user entered.
   *
   * @example
   * ```ts
   * const result = await sanly.verifyOtp({ phone: '+99361234567', code: '123456' })
   * if (result.verified) { / * proceed * / }
   * ```
   */
  async verifyOtp(params: VerifyOtpParams): Promise<VerifyOtpResult> {
    if (!params.phone && !params.email) {
      throw new Error('OtpSanly.verifyOtp: provide either "phone" or "email"')
    }
    if (!params.code) {
      throw new Error('OtpSanly.verifyOtp: "code" is required')
    }
    return this.request<VerifyOtpResult>('/api/verify-otp', params as unknown as Record<string, unknown>)
  }
}

export default OtpSanly

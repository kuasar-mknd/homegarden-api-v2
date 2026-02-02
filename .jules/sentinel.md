# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2025-05-23 - Password Leak in Context
**Vulnerability:** The full `User` entity, including the `password` field (even if a placeholder), was attached to the Hono context (`c.set('user', user)`).
**Learning:** Attaching full database entities to request context creates a high risk of accidental leakage if downstream controllers return the context object or spread it into a response.
**Prevention:** Always strip sensitive fields *before* attaching objects to the context. Use strict types for context variables that exclude sensitive fields.

## 2025-05-23 - Fetch Timeouts
**Vulnerability:** External service calls (OpenMeteo, Gemini) lacked explicit timeouts, creating a risk of resource exhaustion (DoS) if the services hang.
**Learning:** `fetch` does not have a default timeout in Node.js.
**Prevention:** Always use `AbortSignal.timeout()` with `fetch`. Wrap SDK calls in timeout promises if the SDK doesn't support timeouts natively.

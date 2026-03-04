# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2024-05-24 - Missing Timeout on External APIs
**Vulnerability:** The application made external HTTP requests (`fetch`) to Open-Meteo and Google Gemini APIs without a timeout, leading to potential Denial of Service (DoS) risks if the external services hung or were slow to respond.
**Learning:** External API integrations should always have an explicit timeout configured to prevent hanging requests that consume application resources indefinitely.
**Prevention:** Always use `AbortSignal.timeout(ms)` when using the built-in `fetch` API for external service calls. Set timeouts appropriate for the service's expected response times (e.g., 5s for simple data fetches, 10s for heavy image processing).

# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.
## 2025-05-23 - External Fetch Timeout
**Vulnerability:** The application fetches external images for processing using `fetch` without setting a timeout. This creates a Denial of Service (DoS) risk if an attacker provides a URL to a server that accepts the connection but hangs indefinitely, exhausting the application's request handling capacity.
**Learning:** Node's `fetch` does not have a default timeout. All external calls must be explicitly bounded.
**Prevention:** Always use `AbortSignal.timeout(ms)` when making outbound HTTP requests with `fetch` to untrusted external URLs.

## 2025-05-23 - XS-Leaks and Missing Nosniff Header
**Vulnerability:** The application disabled the `X-XSS-Protection` header due to XS-Leak concerns by omitting it entirely, and was missing the `X-Content-Type-Options: nosniff` header.
**Learning:** Relying on defaults or omitted headers can leave applications vulnerable to MIME-sniffing attacks and inconsistent browser behavior regarding XSS protection mechanisms. Setting `xXssProtection: '0'` explicitly conveys the intention to disable it securely to avoid XS-Leaks while depending on CSP.
**Prevention:** Explicitly configure all relevant security headers (e.g., using `secureHeaders` in Hono) and include `nosniff`. Set `xXssProtection` to `'0'` if disabling it intentionally.

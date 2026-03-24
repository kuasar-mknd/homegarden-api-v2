# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2026-03-24 - Prevent JWT Algorithm Confusion
**Vulnerability:** `jwt.verify()` was called without explicitly defining the accepted algorithms, making the application susceptible to algorithm confusion attacks (e.g., swapping RS256 with HS256).
**Learning:** The `jsonwebtoken` library defaults to accepting any algorithm specified in the token header, which can be manipulated by an attacker.
**Prevention:** Always enforce the expected algorithm(s) explicitly by passing the `algorithms` option to `jwt.verify()`, e.g., `{ algorithms: ['HS256'] }`.

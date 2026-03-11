# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.
## 2025-05-23 - Rate Limiting IP Spoofing Fix
**Vulnerability:** The rate limiters used the first IP from the `x-forwarded-for` header (`split(',')[0]`), which is easily spoofable by clients sending their own `x-forwarded-for` header.
**Learning:** The first IP in `x-forwarded-for` is the least trusted as it can be set by the client. The last IP appended by the nearest reverse proxy is the most trustworthy if `cf-connecting-ip` or `x-real-ip` are not available.
**Prevention:** Always use the last IP (`split(',').pop()`) from `x-forwarded-for` to identify the client, or use trusted proxy configurations.

# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2025-05-24 - Trusted Proxy Logic in X-Forwarded-For
**Vulnerability:** Rate limiters were taking the *first* IP from `X-Forwarded-For` (`split(',')[0]`). In standard proxy chains, the client IP is at the start, which can be easily spoofed by the client sending their own `X-Forwarded-For` header.
**Learning:** If the application is behind a single trusted proxy (like a load balancer) that *appends* to XFF, the *last* IP in the list is the one verified by that proxy (the machine that connected to it).
**Prevention:** When `cf-connecting-ip` or `x-real-ip` are unavailable and you must rely on XFF behind a standard appending proxy, use the **last** IP (`.pop()`), not the first.

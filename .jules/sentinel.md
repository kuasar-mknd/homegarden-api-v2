# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2026-03-20 - Security Header Configuration
**Vulnerability:** The application incorrectly handled the X-XSS-Protection header, risking XS-Leaks. Also, it lacked the nosniff option for X-Content-Type-Options.
**Learning:** Relying on default settings for security headers without carefully configuring them can leave applications exposed.
**Prevention:** Carefully configure security headers with strict values, disable deprecated/risky features like X-XSS-Protection (preferring CSP), and use established mechanisms (nosniff) to handle legacy behavior effectively.

# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.
## 2024-05-24 - [Hono Arbitrary File Access and Auth Bypass]
**Vulnerability:** Hono and `@hono/node-server` had high severity vulnerabilities allowing arbitrary file access (`serveStatic`), authorization bypass via encoded slashes, and moderate severity issues for Cookie Attribute Injection and SSE Control Field Injection.
**Learning:** Outdated core web framework dependencies can quickly introduce multiple attack vectors including unauthorized file reads and auth bypass on protected paths.
**Prevention:** Regularly audit dependencies (`pnpm audit --prod`) and ensure that package manager overrides explicitly enforce patched versions of foundational frameworks across the entire dependency tree.

# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2025-05-23 - Hono Static Files Authorization Bypass
**Vulnerability:** `@hono/node-server` before 1.19.10 has an authorization bypass for protected static paths via encoded slashes in the Serve Static Middleware. `hono` before 4.12.4 also had vulnerabilities related to `serveStatic`.
**Learning:** Middleware handling static files and paths can often be bypassed if input sanitization and path resolution do not correctly handle URL-encoded components (like encoded slashes). Even widely-used frameworks can have routing/path-resolution edge cases.
**Prevention:** Keep framework dependencies up-to-date and run `pnpm audit --prod` regularly in CI. Override transient dependencies in `package.json`'s `pnpm.overrides` block to ensure all parts of the application (e.g. Prisma's dev dependencies) use patched versions.

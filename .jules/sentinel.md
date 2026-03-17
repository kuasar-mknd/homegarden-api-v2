# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.
## 2026-03-17 - [Hono Security Upgrade]
**Vulnerability:** `hono` < 4.12.7 and `@hono/node-server` < 1.19.10 have high/moderate severity vulnerabilities including authorization bypass on static paths.
**Learning:** CI checks run `pnpm audit --prod`, so failing to update `pnpm.overrides` causes mismatched versions that fail the pipeline.
**Prevention:** When upgrading vulnerable packages, always upgrade their versions in the `pnpm.overrides` block as well.

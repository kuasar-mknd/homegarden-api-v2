# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2025-05-23 - Authorization Header Scheme Bypass
**Vulnerability:** The `authMiddleware` extracted the JWT by using `authHeader.replace('Bearer ', '')`. If the header did not start with `Bearer ` but contained it elsewhere, or was entirely missing the scheme, it would still attempt to parse the string as a token. This could lead to passing malformed data to the upstream identity provider (Supabase).
**Learning:** Relying on simple string replacement for header parsing is insufficient and violates RFC 6750.
**Prevention:** Always strictly validate the `Authorization` header scheme (e.g., using `startsWith('Bearer ')`) before extracting and processing the token.

## 2025-05-23 - Hono Timing Attack Vulnerability
**Vulnerability:** A low-severity timing attack vulnerability was identified in the `hono` package (<4.11.10) affecting `basicAuth` and `bearerAuth` middlewares.
**Learning:** Dependency audits are a critical layer of defense, even for highly regarded frameworks. Timing attacks on authentication endpoints can theoretically leak information about valid tokens or users.
**Prevention:** Run `pnpm audit` regularly in CI to catch and update vulnerable dependencies proactively.

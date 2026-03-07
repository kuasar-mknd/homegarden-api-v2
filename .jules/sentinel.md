# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2025-05-23 - JWT Bearer Token Strict Enforcement
**Vulnerability:** The authentication middleware was blindly removing the string `Bearer ` from the Authorization header without enforcing that it was present. This allowed poorly-formatted requests and potentially alternative schemas to bypass expected token validation logic, resulting in unexpected token strings.
**Learning:** We must explicitly validate header formats before string manipulation to ensure the parsed token corresponds to what we actually expect (a valid JWT string).
**Prevention:** Always use exact string matching or regex for header validation before attempting to extract the underlying credentials.

## 2025-05-23 - Hono Static Files Authorization Bypass
**Vulnerability:** `hono` and `@hono/node-server` had high-severity vulnerabilities relating to directory traversal and authorization bypasses on protected static paths via encoded slashes (`serveStatic`).
**Learning:** Routing and static file serving are notoriously complex regarding URL encoding and path traversal edge cases. Frameworks frequently patch these vulnerabilities.
**Prevention:** Regularly run `pnpm audit --prod` and update framework dependencies proactively, especially those related to routing and file serving.

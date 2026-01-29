# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2025-05-23 - Auth Context Password Leak
**Vulnerability:** The authentication middleware was selecting the full `User` entity, including the `password` field (even if a placeholder), and storing it in the request context `c.set('user', user)`. This creates a risk of accidental exposure if the context user object is logged or returned in error responses.
**Learning:** Default ORM behavior often selects all fields. Storing sensitive fields in global request context increases the attack surface for internal leaks.
**Prevention:** Use a strictly defined `USER_SAFE_SELECT` object to explicitly allowlist only non-sensitive fields when fetching user data for the request context.

## 2025-05-23 - Base64 MIME Type Spoofing
**Vulnerability:** The Plant ID endpoint accepted `imageBase64` strings with a user-provided `mimeType` without verifying that the file content (magic bytes) actually matched the declared type.
**Learning:** Relying on client-provided MIME types for content negotiation or processing is insecure. Base64 strings can hide malicious file types just as easily as file uploads.
**Prevention:** Always validate the "Magic Bytes" (file signature) of decoded Base64 content against the expected MIME type before processing.

# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2025-05-23 - Content Security Policy (CSP) Inline Scripts
**Vulnerability:** The application was using `'unsafe-inline'` for `script-src` and `style-src` directives in its Content Security Policy, making it vulnerable to Cross-Site Scripting (XSS) if user input was ever reflected into the HTML.
**Learning:** Hardcoding `'unsafe-inline'` completely bypasses the protections of CSP against injected scripts.
**Prevention:** Always use dynamic nonces (e.g. `crypto.randomUUID()`) generated per-request or strict hashes instead of `'unsafe-inline'`. Store the generated nonce in the request context and inject it into `<script nonce="...">` elements and the `Content-Security-Policy` HTTP header.

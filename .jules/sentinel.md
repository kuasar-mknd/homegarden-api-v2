# Sentinel Journal - Security Findings

## 2025-05-23 - Hardcoded Secrets & Rate Limit Bypassing
**Vulnerability:** A hardcoded default secret `'default-secret-key-change-it'` was found in `TokenService.ts` as a fallback if `JWT_SECRET` is missing.
**Learning:** Even unused or "legacy" services can present a risk if they contain insecure defaults that might be inadvertently enabled or used in the future.
**Prevention:** Always enforce strict configuration validation. Never provide insecure defaults for critical secrets (authentication keys, API keys). Fail fast if configuration is missing.

## 2025-05-23 - Rate Limiting IP Spoofing
**Vulnerability:** The rate limiter used `x-forwarded-for` directly without parsing. An attacker could potentially bypass rate limits by appending fake IPs or spoofing the header if not properly sanitized by a proxy.
**Learning:** Relying on raw `x-forwarded-for` is risky.
**Prevention:** Prioritize `cf-connecting-ip` or `x-real-ip` when available. When using `x-forwarded-for`, be aware of the trust model (e.g., standard proxy chains) and ideally configure trusted proxies.

## 2026-03-25 - WebSocket Authentication Bypass (IDOR)
**Vulnerability:** The WebSocket message handler blindly trusted the `userId` payload provided by the client, allowing any user to subscribe to or query care reminders for any other user's ID.
**Learning:** In a WebSocket environment, authentication must be established at the connection layer, and all subsequent messages must rely on the session-bound identity rather than client-provided identity.
**Prevention:** Authenticate WebSocket connections during the handshake phase (e.g., via query parameters) and attach the verified user's ID to the connection object. Handlers should use this server-side identity exclusively.
